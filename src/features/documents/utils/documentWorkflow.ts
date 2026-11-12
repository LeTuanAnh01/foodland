import type { BusinessDoc, DB, DocKind, StockMovementV2 } from '@/data/types';

export type WorkflowResult = { ok: true } | { ok: false; message: string };

export function movementKindForDoc(kind: DocKind) {
  return kind === 'buy' ? 'Nhập kho' : 'Xuất kho';
}

// Tổng số đã xác nhận + số lượng trên các phiếu nháp (đang chờ giao nhận).
// excludeId dùng khi sửa phiếu để tránh tính trùng phiếu đang chỉnh.
export function documentQuantities(
  db: Pick<DB, 'stockMovements'>,
  doc: BusinessDoc,
  excludeId?: string,
) {
  const ordered = new Map<string, number>();
  for (const line of doc.lines) {
    ordered.set(line.productId, (ordered.get(line.productId) ?? 0) + line.quantity);
  }
  const confirmed = new Map<string, number>();
  const drafts = new Map<string, number>();
  for (const movement of db.stockMovements) {
    if (movement.sourceDocId !== doc.id || movement.id === excludeId) continue;
    const target = movement.status === 'confirmed' ? confirmed : drafts;
    for (const line of movement.lines) {
      target.set(line.productId, (target.get(line.productId) ?? 0) + line.quantity);
    }
  }
  return [...ordered].map(([productId, quantity]) => {
    const received = confirmed.get(productId) ?? 0;
    const pending = drafts.get(productId) ?? 0;
    return {
      productId,
      ordered: quantity,
      confirmed: received,
      pending,
      available: Math.max(0, Math.round((quantity - received - pending) * 1e6) / 1e6),
    };
  });
}

export function validateLinkedMovement(
  db: Pick<DB, 'docs' | 'stockMovements'>,
  movement: StockMovementV2,
  excludeId?: string,
): WorkflowResult {
  if (!movement.sourceDocId) return { ok: true };
  const doc = db.docs.find((item) => item.id === movement.sourceDocId);
  if (!doc) return { ok: false, message: 'Không tìm thấy chứng từ liên kết.' };
  if (doc.status !== 'Đã xác nhận') {
    return { ok: false, message: 'Cần xác nhận chứng từ trước khi lập phiếu kho.' };
  }
  if (movement.kind !== movementKindForDoc(doc.kind)) {
    return { ok: false, message: 'Loại phiếu kho không phù hợp với chứng từ.' };
  }
  const rows = documentQuantities(db, doc, excludeId);
  const remaining = new Map(rows.map((row) => [row.productId, row.available]));
  const seen = new Set<string>();
  for (const line of movement.lines) {
    if (seen.has(line.productId)) return { ok: false, message: 'Mặt hàng bị lặp trong phiếu.' };
    seen.add(line.productId);
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      return { ok: false, message: 'Số lượng trong phiếu phải lớn hơn 0.' };
    }
    const allowed = remaining.get(line.productId);
    if (allowed === undefined) return { ok: false, message: `Mặt hàng ${line.productId} không thuộc chứng từ.` };
    if (line.quantity > allowed + 1e-7) {
      return { ok: false, message: `Mặt hàng ${line.productId} chỉ còn ${allowed} đơn vị chưa lập phiếu.` };
    }
  }
  return { ok: true };
}

export function validateBusinessDoc(db: Pick<DB, 'products' | 'partners'>, doc: BusinessDoc): WorkflowResult {
  const partner = db.partners.find((item) => item.id === doc.partnerId);
  if (!partner || partner.type !== (doc.kind === 'buy' ? 'supplier' : 'customer')) {
    return { ok: false, message: 'Đối tác không phù hợp với loại chứng từ.' };
  }
  if (!doc.date || doc.lines.length === 0) return { ok: false, message: 'Thiếu ngày hoặc mặt hàng.' };
  const ids = new Set<string>();
  for (const line of doc.lines) {
    if (ids.has(line.productId)) return { ok: false, message: 'Mặt hàng bị trùng trên chứng từ.' };
    ids.add(line.productId);
    if (!db.products.some((item) => item.id === line.productId) ||
        !Number.isFinite(line.quantity) || line.quantity <= 0 ||
        !Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
      return { ok: false, message: 'Mặt hàng, số lượng hoặc đơn giá không hợp lệ.' };
    }
  }
  return { ok: true };
}
