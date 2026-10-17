import { validateLinkedMovement } from '@/features/documents/utils/documentWorkflow';
import type { DB, Stock, StockMovementV2 } from '@/data/types';

export type StockShortage = {
  productId: string;
  requested: number;
  available: number;
  shortage: number;
};

export type MovementCheck = {
  canConfirm: boolean;
  errors: string[];
  shortages: StockShortage[];
};

export type ConfirmationOutcome =
  | { ok: true }
  | { ok: false; message: string };

// Kiểm tra tại thời điểm gọi, không giữ kết quả đủ/thiếu trong phiếu.
export function checkStockMovement(
  movement: StockMovementV2,
  db: Pick<DB, 'stocks' | 'products'>,
): MovementCheck {
  const errors: string[] = [];
  const shortages: StockShortage[] = [];

  if (movement.status !== 'draft') {
    errors.push('Phiếu đã xác nhận, không thể thực hiện lại.');
  }
  if (movement.lines.length === 0) {
    errors.push('Phiếu chưa có mặt hàng.');
  }

  const seen = new Set<string>();
  for (const line of movement.lines) {
    if (seen.has(line.productId)) {
      errors.push(`Mặt hàng ${line.productId} bị trùng trong phiếu.`);
      continue;
    }
    seen.add(line.productId);

    if (!db.products.some((product) => product.id === line.productId)) {
      errors.push(`Không tìm thấy mặt hàng ${line.productId} trong danh mục.`);
      continue;
    }
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      errors.push(`Số lượng của ${line.productId} phải lớn hơn 0.`);
      continue;
    }

    // Prototype hiện tại chỉ có một dòng tồn cho mỗi mã hàng.
    const rows = db.stocks.filter((stock) => stock.productId === line.productId);
    if (rows.length !== 1) {
      errors.push(`Không xác định được tồn kho của ${line.productId}.`);
      continue;
    }
    const available = rows[0].quantity;
    if (!Number.isFinite(available) || available < 0) {
      errors.push(`Tồn kho hiện tại của ${line.productId} không hợp lệ.`);
      continue;
    }

    if (movement.kind === 'Xuất kho' && line.quantity > available) {
      shortages.push({
        productId: line.productId,
        requested: line.quantity,
        available,
        shortage: line.quantity - available,
      });
    }
  }

  return { canConfirm: errors.length === 0 && shortages.length === 0, errors, shortages };
}

// Một phép chuyển trạng thái duy nhất: hoặc tất cả dòng hàng được áp dụng,
// hoặc toàn bộ dữ liệu được giữ nguyên. Không cho phép ghi kho hai lần.
export function confirmMovementInDb(
  db: DB,
  id: string,
): { db: DB; outcome: ConfirmationOutcome } {
  const movement = db.stockMovements.find((item) => item.id === id);
  if (!movement) {
    return { db, outcome: { ok: false, message: 'Không tìm thấy phiếu kho.' } };
  }

  // Một phiếu liên kết chỉ được xuất/nhập trong phần số lượng chứng từ còn lại.
  // Không dùng dữ liệu hiển thị từ lúc mở modal, luôn xét lại khi xác nhận.
  const linkedCheck = validateLinkedMovement(db, movement, movement.id);
  if (!linkedCheck.ok) return { db, outcome: linkedCheck };

  const check = checkStockMovement(movement, db);
  if (!check.canConfirm) {
    const message = check.errors.length
      ? check.errors.join(' ')
      : `Không đủ tồn kho ở ${check.shortages.length} mặt hàng. Vui lòng kiểm tra lại.`;
    return { db, outcome: { ok: false, message } };
  }

  const quantities = new Map(
    movement.lines.map((line) => [line.productId, line.quantity]),
  );
  const sign = movement.kind === 'Nhập kho' ? 1 : -1;
  const stocks: Stock[] = db.stocks.map((stock) => {
    const quantity = quantities.get(stock.productId);
    if (quantity === undefined) return stock;
    return {
      ...stock,
      // Giới hạn sai số dấu phẩy động khi cộng/trừ số lượng thập phân.
      quantity: Math.round((stock.quantity + sign * quantity) * 1_000_000) / 1_000_000,
    };
  });

  return {
    db: {
      ...db,
      stocks,
      stockMovements: db.stockMovements.map((item) =>
        item.id === id ? { ...item, status: 'confirmed', stockApplied: true } : item,
      ),
    },
    outcome: { ok: true },
  };
}
