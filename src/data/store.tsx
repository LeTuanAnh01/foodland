import * as React from 'react';
import { initial } from '@/data/mocks/initialData';
import { validateBusinessDoc, validateLinkedMovement } from '@/features/documents/utils/documentWorkflow';
import type { WorkflowResult } from '@/features/documents/utils/documentWorkflow';
import { confirmMovementInDb } from '@/features/inventory/utils/stockConfirmation';
import type { ConfirmationOutcome } from '@/features/inventory/utils/stockConfirmation';
import { loadDemoData, saveDemoData } from '@/data/repositories/localStorageRepository';
import type {
  DB,
  Product,
  Stock,
  Partner,
  BusinessDoc,
  Invoice,
  StockMovementV2,
  StockCheck,
} from '@/data/types';

export type {
  Product,
  Stock,
  Partner,
  BusinessDoc,
  Invoice,
  DocKind,
  Line,
  DB,
  StockMovement,
  StockMovementKind,
  StockMovementLine,
  StockMovementV2,
  StockCheck,
} from '@/data/types';

export const subtotal = (doc: BusinessDoc) =>
  doc.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

type Context = {
  db: DB;
  saveProduct: (product: Product, previousId?: string) => void;
  saveStock: (item: Stock) => void;
  savePartner: (partner: Partner) => void;
  saveDoc: (doc: BusinessDoc, previousId?: string) => WorkflowResult;
  deleteDoc: (id: string) => WorkflowResult;
  confirmDoc: (id: string) => WorkflowResult;
  saveInvoice: (invoice: Invoice) => WorkflowResult;
  confirmInvoice: (id: string) => WorkflowResult;
  saveStockMovement: (movement: StockMovementV2) => WorkflowResult;
  deleteStockMovement: (id: string) => void;
  confirmStockMovement: (id: string) => ConfirmationOutcome;
  saveStockCheck: (check: StockCheck) => void;
  reset: () => void;
};

const Store = React.createContext<Context | null>(null);

export function FoodlandProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<DB>(loadDemoData);
  const dbRef = React.useRef(db);

  // Giữ dữ liệu mới nhất ngay trong cùng event, tránh dùng tồn kho stale
  // khi hai thao tác liên tiếp được React gom vào một batch.
  const commit = React.useCallback((change: (current: DB) => DB) => {
    const next = change(dbRef.current);
    if (next === dbRef.current) return;
    dbRef.current = next;
    setDb(next);
  }, []);

  React.useEffect(() => {
    saveDemoData(db);
  }, [db]);

  const value = React.useMemo<Context>(
    () => ({
      db,
      saveProduct: (product, previousId) =>
        commit((previous) => {
          const oldId = previousId || product.id;
          const existed = previous.products.some((item) => item.id === oldId);

          return {
            ...previous,
            products: existed
              ? previous.products.map((item) => (item.id === oldId ? product : item))
              : [...previous.products, product],
            stocks: existed
              ? previous.stocks.map((stock) =>
                  stock.productId === oldId ? { ...stock, productId: product.id } : stock,
                )
              : [
                  ...previous.stocks,
                  { productId: product.id, quantity: 0, min: 10, location: 'Kho chính' },
                ],
            stockMovements: existed
              ? previous.stockMovements.map((movement) => ({
                  ...movement,
                  lines: movement.lines.map((line) =>
                    line.productId === oldId
                      ? { ...line, productId: product.id }
                      : line,
                  ),
                }))
              : previous.stockMovements,
          };
        }),
      saveStock: (stock) =>
        commit((previous) => ({
          ...previous,
          stocks: previous.stocks.map((item) =>
            item.productId === stock.productId ? stock : item,
          ),
        })),
      savePartner: (partner) =>
        commit((previous) => ({ ...previous, partners: [...previous.partners, partner] })),
      saveDoc: (doc, previousId) => {
        const previous = dbRef.current;
        const existing = previous.docs.find((item) => item.id === doc.id);
        if (existing && !previousId) {
          return { ok: false, message: 'Mã chứng từ đã tồn tại.' };
        }
        if (previousId && (!existing || previousId !== doc.id)) {
          return { ok: false, message: 'Không tìm thấy chứng từ để sửa.' };
        }
        if (existing?.status === 'Đã xác nhận') {
          return { ok: false, message: 'Không thể sửa chứng từ đã xác nhận.' };
        }
        const check = validateBusinessDoc(previous, doc);
        if (!check.ok) return check;
        commit((db) => ({
          ...db,
          docs: existing
            ? db.docs.map((item) => item.id === doc.id ? { ...doc, status: 'Bản nháp' } : item)
            : [{ ...doc, status: 'Bản nháp' }, ...db.docs],
        }));
        return { ok: true };
      },
      deleteDoc: (id) => {
        const db = dbRef.current;
        const doc = db.docs.find((item) => item.id === id);
        if (!doc || doc.status !== 'Bản nháp') {
          return { ok: false, message: 'Chỉ được xóa chứng từ bản nháp.' };
        }
        if (db.invoices.some((invoice) => invoice.docId === id) ||
            db.stockMovements.some((item) => item.sourceDocId === id)) {
          return { ok: false, message: 'Chứng từ đã có hóa đơn hoặc phiếu kho liên kết.' };
        }
        commit((previous) => ({ ...previous, docs: previous.docs.filter((item) => item.id !== id) }));
        return { ok: true };
      },
      confirmDoc: (id) => {
        const db = dbRef.current;
        const doc = db.docs.find((item) => item.id === id);
        if (!doc || doc.status !== 'Bản nháp') {
          return { ok: false, message: 'Chứng từ không tồn tại hoặc đã xác nhận.' };
        }
        const check = validateBusinessDoc(db, doc);
        if (!check.ok) return check;
        commit((previous) => ({
          ...previous,
          docs: previous.docs.map((item) => item.id === id
            ? { ...item, status: 'Đã xác nhận' }
            : item),
        }));
        return { ok: true };
      },
      saveInvoice: (invoice) => {
        const db = dbRef.current;
        const doc = db.docs.find((item) => item.id === invoice.docId);
        if (!doc || doc.kind !== invoice.kind || doc.status !== 'Đã xác nhận') {
          return { ok: false, message: 'Hãy chọn một chứng từ đã xác nhận phù hợp.' };
        }
        if (!invoice.number.trim() || !invoice.date ||
            db.invoices.some((item) => item.docId === invoice.docId ||
              (item.kind === invoice.kind && item.number.trim() === invoice.number.trim() && item.symbol.trim() === invoice.symbol.trim()))) {
          return { ok: false, message: 'Thiếu thông tin hoặc hóa đơn đã được liên kết/trùng số.' };
        }
        commit((previous) => ({
          ...previous,
          invoices: [{ ...invoice, status: 'draft' }, ...previous.invoices],
          docs: previous.docs.map((item) => item.id === invoice.docId
            ? { ...item, invoiceNo: invoice.number.trim() }
            : item),
        }));
        return { ok: true };
      },
      confirmInvoice: (id) => {
        const invoice = dbRef.current.invoices.find((item) => item.id === id);
        if (!invoice || invoice.status !== 'draft') {
          return { ok: false, message: 'Hóa đơn không tồn tại hoặc đã xác nhận.' };
        }
        commit((previous) => ({
          ...previous,
          invoices: previous.invoices.map((item) => item.id === id
            ? { ...item, status: 'confirmed' }
            : item),
        }));
        return { ok: true };
      },
      saveStockMovement: (movement) => {
        const db = dbRef.current;
        const existing = db.stockMovements.find((item) => item.id === movement.id);
        if (existing?.status === 'confirmed') {
          return { ok: false, message: 'Phiếu đã xác nhận không thể sửa.' };
        }
        if (existing && existing.sourceDocId !== movement.sourceDocId) {
          return { ok: false, message: 'Không thể thay đổi chứng từ gốc của phiếu kho.' };
        }
        if (!movement.lines.length || movement.lines.some((line) =>
          !Number.isFinite(line.quantity) || line.quantity <= 0 ||
          !db.products.some((product) => product.id === line.productId))) {
          return { ok: false, message: 'Dữ liệu mặt hàng không hợp lệ.' };
        }
        const check = validateLinkedMovement(db, movement, existing?.id);
        if (!check.ok) return check;
        commit((previous) => ({
          ...previous,
          stockMovements: existing
            ? previous.stockMovements.map((item) => item.id === movement.id ? movement : item)
            : [movement, ...previous.stockMovements],
        }));
        return { ok: true };
      },
      deleteStockMovement: (id) =>
        commit((previous) => ({
          ...previous,
          stockMovements: previous.stockMovements.filter(
            (item) => item.id !== id || item.status !== 'draft',
          ),
        })),
      confirmStockMovement: (id) => {
        // Xác nhận phải kiểm tra lại tồn kho mới nhất, không tin số lượng
        // đã hiển thị trước đó trong modal.
        const { db: next, outcome } = confirmMovementInDb(dbRef.current, id);
        if (outcome.ok) {
          dbRef.current = next;
          setDb(next);
        }
        return outcome;
      },
      saveStockCheck: (check) =>
        commit((previous) => ({
          ...previous,
          stockChecks: [check, ...previous.stockChecks],
        })),
      reset: () => commit(() => structuredClone(initial)),
    }),
    [db, commit],
  );

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useFoodland() {
  const context = React.useContext(Store);
  if (!context) throw Error('FoodlandProvider missing');
  return context;
}
