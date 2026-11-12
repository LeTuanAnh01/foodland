import type { DB, BusinessDoc, StockMovementV2 } from '../../../data/types';
import { matchesDateFilter } from '../../../lib/dateFilter';
import type { DateFilterValue } from '../../../lib/dateFilter';

/** Chỉ số quản trị từ chứng từ đã xác nhận, KHÔNG phải doanh thu/lợi nhuận kế toán. */
export function confirmedDocuments(db: DB, period: DateFilterValue): BusinessDoc[] {
  return db.docs.filter((doc) =>
    doc.status === 'Đã xác nhận' && matchesDateFilter(doc.date, period),
  );
}

export function documentAmount(doc: BusinessDoc): number {
  return doc.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function businessSummary(db: DB, period: DateFilterValue) {
  const docs = confirmedDocuments(db, period);
  const buy = docs.filter((doc) => doc.kind === 'buy');
  const sell = docs.filter((doc) => doc.kind === 'sell');
  return {
    buyValue: buy.reduce((sum, doc) => sum + documentAmount(doc), 0),
    sellValue: sell.reduce((sum, doc) => sum + documentAmount(doc), 0),
    buyCount: buy.length,
    sellCount: sell.length,
  };
}

/** Biểu đồ thể hiện giá trị các chứng từ đã xác nhận, theo ngày chứng từ. */
export function monthlyBusinessTotals(db: DB, year: number) {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: `T${index + 1}`,
    buy: 0,
    sell: 0,
  }));
  if (!Number.isInteger(year) || year < 1900 || year > 2200) return months;
  for (const doc of db.docs) {
    if (doc.status !== 'Đã xác nhận' || !doc.date.startsWith(`${year}-`)) continue;
    const month = Number(doc.date.slice(5, 7));
    if (month < 1 || month > 12) continue;
    months[month - 1][doc.kind] += documentAmount(doc);
  }
  return months;
}

/** Xếp theo số lượng trên chứng từ BÁN đã xác nhận, không phải số lượng xuất kho thực tế. */
export function topProductsFromSalesDocs(db: DB, period: DateFilterValue, limit = 5) {
  const quantities = new Map<string, number>();
  for (const doc of confirmedDocuments(db, period)) {
    if (doc.kind !== 'sell') continue;
    for (const line of doc.lines) {
      quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
    }
  }
  return [...quantities.entries()]
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.productId.localeCompare(b.productId))
    .slice(0, limit);
}

export function confirmedMovements(db: DB, period: DateFilterValue): StockMovementV2[] {
  return db.stockMovements.filter((movement) =>
    movement.status === 'confirmed' && matchesDateFilter(movement.date, period),
  );
}

/** Từng mã hàng có đơn vị riêng; không cộng số lượng khác đơn vị để làm KPI. */
export function inventoryActivityByProduct(db: DB, period: DateFilterValue) {
  const quantities = new Map<string, { received: number; issued: number }>();
  for (const movement of confirmedMovements(db, period)) {
    for (const line of movement.lines) {
      const values = quantities.get(line.productId) ?? { received: 0, issued: 0 };
      if (movement.kind === 'Nhập kho') values.received += line.quantity;
      else values.issued += line.quantity;
      quantities.set(line.productId, values);
    }
  }
  return quantities;
}

export function reportYears(db: DB): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const entry of [...db.docs, ...db.stockMovements]) {
    const year = Number(entry.date.slice(0, 4));
    if (year >= 2000 && year <= 2100) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}
