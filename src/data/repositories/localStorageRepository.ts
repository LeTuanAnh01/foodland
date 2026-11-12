import type { DB, Invoice, StockMovement, StockMovementV2 } from '@/data/types';
import { initial } from '@/data/mocks/initialData';

// Không đổi key để giữ dữ liệu v0.3/v0.4 trên cùng origin.
const KEY = 'foodland-react-prototype-v1';

type LegacyInvoice = Omit<Invoice, 'status'> & { status?: Invoice['status'] };
type StoredDB = Omit<Partial<DB>, 'stockMovements' | 'invoices'> & {
  stockMovements?: Array<StockMovement | StockMovementV2>;
  invoices?: LegacyInvoice[];
};

export function migrateStockMovements(
  movements: Array<StockMovement | StockMovementV2>,
): StockMovementV2[] {
  return movements.map((movement) => {
    if ('lines' in movement && Array.isArray(movement.lines)) {
      return {
        id: movement.id,
        date: movement.date,
        kind: movement.kind,
        status: movement.status === 'confirmed' ? 'confirmed' : 'draft',
        ...(movement.stockApplied === true ? { stockApplied: true } : {}),
        ...(typeof movement.sourceDocId === 'string' ? { sourceDocId: movement.sourceDocId } : {}),
        note: movement.note ?? '',
        lines: movement.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      };
    }

    const oldMovement = movement as StockMovement;
    return {
      id: oldMovement.id,
      date: oldMovement.date,
      kind: oldMovement.kind,
      status: 'draft',
      note: oldMovement.note ?? '',
      lines: [{ productId: oldMovement.productId, quantity: oldMovement.qty }],
    };
  });
}

export function loadDemoData(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(initial);

    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'products' in parsed &&
      Array.isArray(parsed.products) &&
      'docs' in parsed &&
      Array.isArray(parsed.docs)
    ) {
      const previous = parsed as StoredDB;
      // Lưu bản sao thô một lần trước khi chuyển các phiếu v0.4 sang v0.5.
      if (
        Array.isArray(previous.stockMovements) &&
        previous.stockMovements.some((movement) => !('lines' in movement)) &&
        !localStorage.getItem(`${KEY}-backup-v0.4`)
      ) {
        try {
          localStorage.setItem(`${KEY}-backup-v0.4`, raw);
        } catch {
          // Hết dung lượng: vẫn tiếp tục chuyển đổi dữ liệu trong bộ nhớ.
        }
      }
      return {
        ...structuredClone(initial),
        ...previous,
        stockMovements: migrateStockMovements(
          Array.isArray(previous.stockMovements)
            ? previous.stockMovements
            : structuredClone(initial.stockMovements),
        ),
        stockChecks: Array.isArray(previous.stockChecks)
          ? previous.stockChecks
          : structuredClone(initial.stockChecks),
        invoices: Array.isArray(previous.invoices)
          ? previous.invoices.map((invoice) => ({
              ...invoice,
              status: invoice.status === 'draft' ? 'draft' : 'confirmed',
            }))
          : structuredClone(initial.invoices),
      };
    }
  } catch {
    // Không đọc được localStorage hoặc dữ liệu không đúng JSON.
  }
  return structuredClone(initial);
}

export function saveDemoData(data: DB): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Prototype chỉ lưu trên trình duyệt.
  }
}
