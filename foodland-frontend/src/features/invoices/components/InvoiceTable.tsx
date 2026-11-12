import * as React from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { useFoodland } from '@/data/store';
import type { BusinessDoc, Invoice } from '@/data/types';
import { dateVN } from '@/lib/utils';

type Props = {
  invoices: Invoice[];
  total: number;
  docs: BusinessDoc[];
  partnerName: (id: string) => string;
};

export function InvoiceTable({ invoices, docs, partnerName }: Props) {
  const { confirmInvoice } = useFoodland();
  const [notice, setNotice] = React.useState('');
  const pagination = usePagination(invoices);

  function approve(id: string) {
    const result = confirmInvoice(id);
    setNotice(result.ok
      ? `Đã xác nhận thông tin hóa đơn ${id}. Tồn kho và trạng thái chứng từ không thay đổi.`
      : result.message);
  }

  return <>
    <p className="px-5 pt-4 text-xs text-slate-500">
      Hóa đơn lưu tại Foodland chỉ là dữ liệu liên kết nội bộ, không phải chức năng phát hành hóa đơn điện tử.
      Xác nhận thông tin hóa đơn không cập nhật tồn kho.
    </p>
    {notice && <p role="status" className="mx-5 mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}
    <TableScroll><table className="data-table">
      <thead><tr><th>NGÀY HÓA ĐƠN</th><th>SỐ HÓA ĐƠN</th><th>KÝ HIỆU</th><th>CHỨNG TỪ LIÊN KẾT</th><th>ĐỐI TÁC</th><th>GHI CHÚ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
      <tbody>{pagination.items.map((invoice) => {
        const doc = docs.find((item) => item.id === invoice.docId);
        return <tr key={invoice.id}>
          <td>{dateVN(invoice.date)}</td>
          <td className="font-bold text-emerald-700">{invoice.number}</td>
          <td>{invoice.symbol}</td>
          <td><Badge tone="blue"><Link2 size={12} /> {invoice.docId}</Badge></td>
          <td>{partnerName(doc?.partnerId || '')}</td>
          <td>{invoice.note || '—'}</td>
          <td><Badge tone={invoice.status === 'draft' ? 'orange' : 'green'}>
            {invoice.status === 'draft' ? 'Bản nháp' : 'Đã xác nhận thông tin'}
          </Badge></td>
          <td>{invoice.status === 'draft' ? (
            <Button variant="outline" size="sm" onClick={() => approve(invoice.id)}>
              <CheckCircle2 size={14} /> Xác nhận
            </Button>
          ) : <span className="text-xs text-slate-400">—</span>}</td>
        </tr>;
      })}</tbody>
    </table>{!invoices.length && <EmptyState />}</TableScroll>
    <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
  </>;
}
