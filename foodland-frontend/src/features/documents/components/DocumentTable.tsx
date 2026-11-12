import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import type { BusinessDoc, Invoice, StockMovementV2 } from '@/data/types';
import { subtotal } from '@/data/store';
import { dateVN, money } from '@/lib/utils';
import { getDocumentAttention } from '../utils/documentAttention';

type Props = {
  documents: BusinessDoc[];
  movements: StockMovementV2[];
  invoices: Invoice[];
  total: number;
  partnerName: (id: string) => string;
  onView: (id: string) => void;
};

export function DocumentTable({ documents, movements, invoices, partnerName, onView }: Props) {
  const pagination = usePagination(documents);
  return (
    <>
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>NGÀY</th>
              <th>SỐ CHỨNG TỪ</th>
              <th>ĐỐI TÁC</th>
              <th>NỘI DUNG</th>
              <th>GIÁ TRỊ CHỨNG TỪ</th>
              <th>HÓA ĐƠN</th>
              <th>TRẠNG THÁI CHỨNG TỪ</th>
              <th>TRẠNG THÁI KHO</th>
              <th>PHIẾU KHO</th>
              <th>CẦN XỬ LÝ</th>
              <th>CHI TIẾT</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((doc) => {
              const attention = getDocumentAttention({ stockMovements: movements, invoices }, doc);
              const progress = attention.progress;

              return (
                <tr key={doc.id} className={attention.needsReview ? 'bg-amber-50/30' : undefined}>
                  <td>{dateVN(doc.date)}</td>
                  <td className="font-bold text-emerald-700">{doc.id}</td>
                  <td>{partnerName(doc.partnerId)}</td>
                  <td>{doc.note || '—'}</td>
                  <td className="!font-bold">{money(subtotal(doc))}</td>
                  <td>
                    {doc.invoiceNo
                      ? <Badge tone="blue">{doc.invoiceNo}</Badge>
                      : <span className="text-slate-400">Chưa có</span>}
                  </td>
                  <td>
                    <Badge tone={doc.status === 'Bản nháp' ? 'orange' : 'green'}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex min-w-[135px] flex-col items-start gap-1.5">
                      <Badge tone={progress.tone}>{progress.label}</Badge>
                      {progress.status === 'partial' && (
                        <span className="text-[11px] text-slate-500">
                          Còn {progress.remainingProductCount} mặt hàng chưa đủ
                        </span>
                      )}
                      {progress.pendingCount > 0 && (
                        <span className="text-[11px] text-amber-700">
                          {progress.pendingCount} phiếu chờ xác nhận
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-xs">
                    {progress.linkedCount > 0 ? `${progress.linkedCount} phiếu liên kết` : 'Chưa có'}
                  </td>
                  <td>
                    {attention.needsReview ? (
                      <span className="block max-w-48 text-[11px] leading-5 text-amber-800" title={attention.reasons.join(' · ')}>
                        <Badge tone="orange">Cần xử lý</Badge>
                        <span className="mt-1 block">{attention.reasons[0]}</span>
                        {attention.reasons.length > 1 && <span className="block text-amber-700">và {attention.reasons.length - 1} việc khác</span>}
                      </span>
                    ) : <Badge tone="green">Đã xử lý đủ</Badge>}
                  </td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => onView(doc.id)}>
                      <Eye size={14} /> Xem
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!documents.length && <EmptyState />}
      </TableScroll>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
    </>
  );
}
