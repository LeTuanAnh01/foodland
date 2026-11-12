import type { BusinessDoc, DB, DocKind, Invoice } from '@/data/types';
import { getDocumentProgress } from './documentProgress';

export type InvoiceReviewStatus = 'missing' | Invoice['status'];

/**
 * Một chứng từ cần kiểm tra nếu chưa duyệt, chưa giao/nhận đủ theo phiếu kho
 * đã xác nhận, hoặc chưa ghi nhận + xác nhận thông tin hóa đơn.
 * Không dùng trạng thái phiếu nháp để giả định hàng đã giao/nhận.
 */
export function getDocumentAttention(db: Pick<DB, 'stockMovements' | 'invoices'>, doc: BusinessDoc) {
  const progress = getDocumentProgress(db, doc);
  const invoice = db.invoices.find((item) => item.docId === doc.id);
  const invoiceStatus: InvoiceReviewStatus = invoice?.status ?? 'missing';

  const reasons: string[] = [];
  if (doc.status === 'Bản nháp') reasons.push('Chứng từ chưa xác nhận');
  if (progress.status !== 'complete') reasons.push(doc.kind === 'buy' ? 'Chưa nhập đủ hàng' : 'Chưa xuất đủ hàng');
  if (progress.pendingCount > 0) reasons.push(`${progress.pendingCount} phiếu kho nháp chờ xác nhận`);
  if (invoiceStatus === 'missing') reasons.push('Chưa có hóa đơn liên kết');
  if (invoiceStatus === 'draft') reasons.push('Hóa đơn chưa xác nhận');

  return {
    progress,
    invoiceStatus,
    needsReview: reasons.length > 0,
    reasons,
  };
}

export function countDocumentsNeedingReview(db: DB, kind: DocKind) {
  return db.docs.filter((doc) => doc.kind === kind && getDocumentAttention(db, doc).needsReview).length;
}

/** Số badge là số BẢN GHI cần thao tác, không cộng số lượng mặt hàng. */
export function getPendingNavigationCounts(db: DB) {
  const purchases = countDocumentsNeedingReview(db, 'buy');
  const sales = countDocumentsNeedingReview(db, 'sell');
  const inventory = db.stockMovements.filter((item) => item.status === 'draft').length;
  const purchaseInvoices = db.invoices.filter((item) => item.kind === 'buy' && item.status === 'draft').length;
  const saleInvoices = db.invoices.filter((item) => item.kind === 'sell' && item.status === 'draft').length;
  return {
    purchases, sales, inventory,
    purchaseInvoices, saleInvoices,
    total: purchases + sales + inventory,
  };
}

/**
 * Mặc định đưa chứng từ chưa giao/nhận đủ lên trước; trong mỗi nhóm, ưu tiên
 * ngày cũ để công việc tồn đọng không bị chứng từ mới đẩy xuống dưới.
 */
export function getDocumentPriority(db: Pick<DB, 'stockMovements' | 'invoices'>, doc: BusinessDoc) {
  const state = getDocumentAttention(db, doc);
  if (doc.status === 'Bản nháp' || state.progress.status !== 'complete') return 0;
  if (state.needsReview) return 1;
  return 2;
}

export type DocumentSort = 'pending' | 'newest' | 'oldest';

export function sortDocuments(db: Pick<DB, 'stockMovements' | 'invoices'>, docs: BusinessDoc[], sort: DocumentSort) {
  // Chỉ tính trạng thái mỗi chứng từ một lần; không quét phiếu kho trong từng
  // lần so sánh của Array.sort, giúp danh sách dài vẫn phản hồi tốt.
  const priorities = new Map(sort === 'pending'
    ? docs.map((doc) => [doc.id, getDocumentPriority(db, doc)] as const)
    : []);

  return [...docs].sort((a, b) => {
    if (sort === 'pending') {
      const priorityA = priorities.get(a.id) ?? 2;
      const priorityB = priorities.get(b.id) ?? 2;
      if (priorityA !== priorityB) return priorityA - priorityB;
      // Công việc cũ chưa xử lý nên đứng trước công việc mới.
      if (priorityA < 2 && a.date !== b.date) return a.date.localeCompare(b.date);
    }
    if (a.date !== b.date) {
      return sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    }
    return b.id.localeCompare(a.id);
  });
}

export function countForNavigationPath(
  path: string,
  counts: ReturnType<typeof getPendingNavigationCounts>,
): number {
  if (path === '/purchases') return counts.purchases;
  if (path === '/sales') return counts.sales;
  if (path === '/inventory') return counts.inventory;
  return 0;
}
