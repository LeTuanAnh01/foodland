/**
 * Pure business mutations for the Foodland demo.
 * No React, localStorage, fetch or UI code should appear here.
 * Every operation receives the latest DB and returns a new DB, or the same
 * object on validation failure, so callers can safely avoid saving failures.
 */
import { initial } from '@/data/mocks/initialData';
import type {
  BusinessDoc,
  DB,
  Invoice,
  Partner,
  Product,
  Stock,
  StockCheck,
  StockMovementV2,
} from '@/data/types';
import { validateBusinessDoc, validateLinkedMovement } from '@/features/documents/utils/documentWorkflow';
import type { WorkflowResult } from '@/features/documents/utils/documentWorkflow';
import { confirmMovementInDb } from '@/features/inventory/utils/stockConfirmation';
import type { ConfirmationOutcome } from '@/features/inventory/utils/stockConfirmation';

export type CommandResult = { db: DB; result: WorkflowResult };
export type ConfirmationResult = { db: DB; result: ConfirmationOutcome };
const failed = (db: DB, message: string): CommandResult => ({ db, result: { ok: false, message } });
const succeeded = (db: DB): CommandResult => ({ db, result: { ok: true } });

export function saveProduct(db: DB, product: Product, previousId?: string): DB {
  const oldId = previousId || product.id;
  const existed = db.products.some((item) => item.id === oldId);
  return {
    ...db,
    products: existed
      ? db.products.map((item) => (item.id === oldId ? product : item))
      : [...db.products, product],
    stocks: existed
      ? db.stocks.map((stock) =>
          stock.productId === oldId ? { ...stock, productId: product.id } : stock,
        )
      : [...db.stocks, { productId: product.id, quantity: 0, min: 10, location: 'Kho chính' }],
    stockMovements: existed
      ? db.stockMovements.map((movement) => ({
          ...movement,
          lines: movement.lines.map((line) =>
            line.productId === oldId ? { ...line, productId: product.id } : line,
          ),
        }))
      : db.stockMovements,
  };
}

export function saveStock(db: DB, stock: Stock): DB {
  return {
    ...db,
    stocks: db.stocks.map((item) => (item.productId === stock.productId ? stock : item)),
  };
}

export function savePartner(db: DB, partner: Partner): DB {
  return { ...db, partners: [...db.partners, partner] };
}

export function saveDocument(db: DB, doc: BusinessDoc, previousId?: string): CommandResult {
  const existing = db.docs.find((item) => item.id === doc.id);
  if (existing && !previousId) return failed(db, 'Mã chứng từ đã tồn tại.');
  if (previousId && (!existing || previousId !== doc.id)) {
    return failed(db, 'Không tìm thấy chứng từ để sửa.');
  }
  if (existing?.status === 'Đã xác nhận') {
    return failed(db, 'Không thể sửa chứng từ đã xác nhận.');
  }
  const check = validateBusinessDoc(db, doc);
  if (!check.ok) return { db, result: check };
  return succeeded({
    ...db,
    docs: existing
      ? db.docs.map((item) => (item.id === doc.id ? { ...doc, status: 'Bản nháp' } : item))
      : [{ ...doc, status: 'Bản nháp' }, ...db.docs],
  });
}

export function deleteDocument(db: DB, id: string): CommandResult {
  const doc = db.docs.find((item) => item.id === id);
  if (!doc || doc.status !== 'Bản nháp') {
    return failed(db, 'Chỉ được xóa chứng từ bản nháp.');
  }
  if (
    db.invoices.some((invoice) => invoice.docId === id) ||
    db.stockMovements.some((item) => item.sourceDocId === id)
  ) {
    return failed(db, 'Chứng từ đã có hóa đơn hoặc phiếu kho liên kết.');
  }
  return succeeded({ ...db, docs: db.docs.filter((item) => item.id !== id) });
}

export function confirmDocument(db: DB, id: string): CommandResult {
  const doc = db.docs.find((item) => item.id === id);
  if (!doc || doc.status !== 'Bản nháp') {
    return failed(db, 'Chứng từ không tồn tại hoặc đã xác nhận.');
  }
  const check = validateBusinessDoc(db, doc);
  if (!check.ok) return { db, result: check };
  return succeeded({
    ...db,
    docs: db.docs.map((item) =>
      item.id === id ? { ...item, status: 'Đã xác nhận' } : item,
    ),
  });
}

export function saveInvoice(db: DB, invoice: Invoice): CommandResult {
  const doc = db.docs.find((item) => item.id === invoice.docId);
  if (!doc || doc.kind !== invoice.kind || doc.status !== 'Đã xác nhận') {
    return failed(db, 'Hãy chọn một chứng từ đã xác nhận phù hợp.');
  }
  if (
    !invoice.number.trim() ||
    !invoice.date ||
    db.invoices.some(
      (item) =>
        item.docId === invoice.docId ||
        (item.kind === invoice.kind &&
          item.number.trim() === invoice.number.trim() &&
          item.symbol.trim() === invoice.symbol.trim()),
    )
  ) {
    return failed(db, 'Thiếu thông tin hoặc hóa đơn đã được liên kết/trùng số.');
  }
  return succeeded({
    ...db,
    invoices: [{ ...invoice, status: 'draft' }, ...db.invoices],
    docs: db.docs.map((item) =>
      item.id === invoice.docId ? { ...item, invoiceNo: invoice.number.trim() } : item,
    ),
  });
}

export function confirmInvoice(db: DB, id: string): CommandResult {
  const invoice = db.invoices.find((item) => item.id === id);
  if (!invoice || invoice.status !== 'draft') {
    return failed(db, 'Hóa đơn không tồn tại hoặc đã xác nhận.');
  }
  return succeeded({
    ...db,
    invoices: db.invoices.map((item) =>
      item.id === id ? { ...item, status: 'confirmed' } : item,
    ),
  });
}

export function saveStockMovement(db: DB, movement: StockMovementV2): CommandResult {
  const existing = db.stockMovements.find((item) => item.id === movement.id);
  if (existing?.status === 'confirmed') {
    return failed(db, 'Phiếu đã xác nhận không thể sửa.');
  }
  if (existing && existing.sourceDocId !== movement.sourceDocId) {
    return failed(db, 'Không thể thay đổi chứng từ gốc của phiếu kho.');
  }
  if (
    !movement.lines.length ||
    movement.lines.some(
      (line) =>
        !Number.isFinite(line.quantity) ||
        line.quantity <= 0 ||
        !db.products.some((product) => product.id === line.productId),
    )
  ) {
    return failed(db, 'Dữ liệu mặt hàng không hợp lệ.');
  }
  const check = validateLinkedMovement(db, movement, existing?.id);
  if (!check.ok) return { db, result: check };
  return succeeded({
    ...db,
    stockMovements: existing
      ? db.stockMovements.map((item) => (item.id === movement.id ? movement : item))
      : [movement, ...db.stockMovements],
  });
}

export function deleteStockMovement(db: DB, id: string): DB {
  return {
    ...db,
    stockMovements: db.stockMovements.filter((item) => item.id !== id || item.status !== 'draft'),
  };
}

export function confirmStockMovement(db: DB, id: string): ConfirmationResult {
  const { db: next, outcome } = confirmMovementInDb(db, id);
  return { db: next, result: outcome };
}

export function saveStockCheck(db: DB, check: StockCheck): DB {
  return { ...db, stockChecks: [check, ...db.stockChecks] };
}

export function resetData(): DB {
  return structuredClone(initial);
}

export function subtotal(doc: BusinessDoc): number {
  return doc.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}
