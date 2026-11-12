import type { BusinessDoc, DB } from '@/data/types';
import { documentQuantities } from './documentWorkflow';

export type FulfillmentStatus = 'none' | 'partial' | 'complete';

// Tiến độ giao nhận được tính từ phiếu kho ĐÃ XÁC NHẬN, không dựa vào
// trạng thái duyệt chứng từ, hóa đơn hay số lượng trên phiếu nháp.
export function getDocumentProgress(
  db: Pick<DB, 'stockMovements'>,
  doc: BusinessDoc,
) {
  const rows = documentQuantities(db, doc).map((row) => ({
    ...row,
    remaining: Math.max(0, Math.round((row.ordered - row.confirmed) * 1e6) / 1e6),
  }));

  const hasConfirmed = rows.some((row) => row.confirmed > 0);
  const isComplete = rows.length > 0 && rows.every((row) => row.remaining <= 1e-7);
  const status: FulfillmentStatus = isComplete
    ? 'complete'
    : hasConfirmed
      ? 'partial'
      : 'none';

  const labels = doc.kind === 'buy'
    ? { none: 'Chưa nhập', partial: 'Nhập một phần', complete: 'Đã nhập đủ' }
    : { none: 'Chưa xuất', partial: 'Xuất một phần', complete: 'Đã xuất đủ' };

  const linked = db.stockMovements.filter((movement) => movement.sourceDocId === doc.id);
  const pendingCount = linked.filter((movement) => movement.status === 'draft').length;

  return {
    status,
    label: labels[status],
    tone: (status === 'complete' ? 'green' : status === 'partial' ? 'orange' : 'gray') as 'green' | 'orange' | 'gray',
    rows,
    pendingCount,
    linkedCount: linked.length,
    remainingProductCount: rows.filter((row) => row.remaining > 1e-7).length,
  };
}
