import * as React from 'react';
import { CheckCircle2, PackagePlus, PackageMinus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { TableScroll, TableFooter, usePagination } from '@/components/shared';
import { useFoodland, subtotal } from '@/data/store';
import type { BusinessDoc } from '@/data/types';
import { dateVN, money } from '@/lib/utils';
import { getDocumentProgress } from '../utils/documentProgress';

type Props = {
  doc: BusinessDoc;
  onClose: () => void;
  onEdit: () => void;
  onCreateStock: () => void;
};

export function DocumentDetailModal({ doc, onClose, onEdit, onCreateStock }: Props) {
  const { db, confirmDoc, deleteDoc } = useFoodland();
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const linked = db.stockMovements.filter((item) => item.sourceDocId === doc.id);
  const invoices = db.invoices.filter((item) => item.docId === doc.id);
  const progress = getDocumentProgress(db, doc);
  const quantities = progress.rows;
  const itemPages = usePagination(doc.lines, [doc.id]);
  const progressPages = usePagination(quantities, [doc.id]);
  const canCreateStock = doc.status === 'Đã xác nhận' &&
    quantities.some((item) => item.available > 0);
  const nameOf = (id: string) => db.products.find((item) => item.id === id)?.name ?? id;

  function approve() {
    const result = confirmDoc(doc.id);
    if (!result.ok) setError(result.message);
    else { setError(''); setNotice('Chứng từ đã xác nhận. Bạn có thể tạo phiếu kho nháp ngay.'); }
  }

  function remove() {
    if (!window.confirm(`Xóa chứng từ nháp ${doc.id}?`)) return;
    const result = deleteDoc(doc.id);
    if (!result.ok) setError(result.message);
    else onClose();
  }

  return (
    <Modal
      wide
      title={`Chi tiết chứng từ ${doc.id}`}
      subtitle="Chứng từ, phiếu kho và hóa đơn có trạng thái độc lập."
      onClose={onClose}
      footer={
        <>
          {doc.status === 'Bản nháp' && (
            <>
              <Button variant="destructive" onClick={remove}><Trash2 size={15} /> Xóa nháp</Button>
              <Button variant="outline" onClick={onEdit}><Pencil size={15} /> Sửa</Button>
              <Button onClick={approve}><CheckCircle2 size={15} /> Xác nhận chứng từ</Button>
            </>
          )}
          {canCreateStock && (
            <Button onClick={onCreateStock}>
              {doc.kind === 'buy' ? <PackagePlus size={15} /> : <PackageMinus size={15} />}
              Tạo phiếu {doc.kind === 'buy' ? 'nhập' : 'xuất'} kho
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </>
      }
    >
      <div className="space-y-5 text-sm">
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-700">{error}</p>}
        {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-700">{notice}</p>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <span className="text-xs text-slate-500">Trạng thái chứng từ</span>
            <div className="mt-1">
              <Badge tone={doc.status === 'Bản nháp' ? 'orange' : 'green'}>{doc.status}</Badge>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">
              {doc.kind === 'buy' ? 'Trạng thái nhập kho' : 'Trạng thái xuất kho'}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={progress.tone}>{progress.label}</Badge>
              {progress.pendingCount > 0 && (
                <span className="text-[11px] text-amber-700">
                  {progress.pendingCount} phiếu nháp đang chờ
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Ngày chứng từ</span>
            <div className="mt-1 font-semibold">{dateVN(doc.date)}</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Đối tác</span>
            <div className="mt-1 font-semibold">
              {db.partners.find((item) => item.id === doc.partnerId)?.name ?? doc.partnerId}
            </div>
          </div>
        </div>
        <section>
          <h3 className="mb-3 font-semibold">Mặt hàng trên chứng từ</h3>
          <TableScroll><table className="data-table">
            <thead><tr><th>MÃ HÀNG</th><th>MẶT HÀNG</th><th>SỐ LƯỢNG</th><th>ĐƠN GIÁ</th><th>THÀNH TIỀN</th></tr></thead>
            <tbody>{itemPages.items.map((line) => <tr key={line.productId}>
              <td>{line.productId}</td><td className="font-medium">{nameOf(line.productId)}</td>
              <td>{line.quantity}</td><td>{money(line.unitPrice)}</td><td className="font-semibold">{money(line.unitPrice * line.quantity)}</td>
            </tr>)}</tbody>
          </table></TableScroll>
          <TableFooter total={itemPages.total} page={itemPages.page} onPageChange={itemPages.setPage}/>
          <p className="mt-2 text-right font-semibold text-emerald-800">Tổng giá trị: {money(subtotal(doc))}</p>
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{doc.kind === 'buy' ? 'Tiến độ nhập kho' : 'Tiến độ xuất kho'}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={progress.tone}>{progress.label}</Badge>
              {canCreateStock && <Badge tone="blue">Còn mặt hàng chưa lập phiếu</Badge>}
            </div>
          </div>
          <TableScroll><table className="data-table">
            <thead><tr>
              <th>MẶT HÀNG</th>
              <th>{doc.kind === 'buy' ? 'CẦN NHẬP' : 'CẦN XUẤT'}</th>
              <th>{doc.kind === 'buy' ? 'ĐÃ NHẬP' : 'ĐÃ XUẤT'}</th>
              <th>{doc.kind === 'buy' ? 'CÒN PHẢI NHẬP' : 'CÒN PHẢI XUẤT'}</th>
              <th>CHỜ XÁC NHẬN (NHÁP)</th>
              <th>CÒN CÓ THỂ LẬP PHIẾU</th>
            </tr></thead>
            <tbody>{progressPages.items.map((row) => <tr key={row.productId}>
              <td>{nameOf(row.productId)}</td>
              <td>{row.ordered}</td>
              <td className="font-semibold">{row.confirmed}</td>
              <td className={row.remaining > 0 ? 'font-semibold text-amber-700' : 'font-semibold text-emerald-700'}>
                {row.remaining}
              </td>
              <td>{row.pending}</td>
              <td className="font-semibold">{row.available}</td>
            </tr>)}</tbody>
          </table></TableScroll>
          <TableFooter total={progressPages.total} page={progressPages.page} onPageChange={progressPages.setPage}/>
          <p className="mt-2 text-xs text-slate-500">
            {progress.status === 'complete'
              ? `Đã ${doc.kind === 'buy' ? 'nhập' : 'xuất'} đủ tất cả mặt hàng theo chứng từ.`
              : `Còn ${progress.remainingProductCount} mặt hàng chưa ${doc.kind === 'buy' ? 'nhập' : 'xuất'} đủ. `}
            Phiếu nháp chỉ giữ chỗ khi lập phiếu mới, chưa được tính là đã giao nhận.
            Tồn kho chỉ thay đổi sau khi xác nhận phiếu tại trang Kho.
          </p>
          {linked.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
            {linked.map((item) => <span key={item.id} className="rounded-lg bg-slate-100 px-3 py-2 text-xs">
              {item.id} · {item.status === 'confirmed' ? 'Đã xác nhận kho' : 'Phiếu nháp'}
            </span>)}
          </div>}
        </section>
        <section className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-2 font-semibold">{doc.kind === 'buy' ? 'Hóa đơn đầu vào' : 'Hóa đơn đầu ra'}</h3>
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có hóa đơn liên kết. Bạn có thể ghi nhận tại tab Hóa đơn mà không cần chờ nhập/xuất kho.</p>
          ) : invoices.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            <span>{item.number} · {dateVN(item.date)}</span>
            <Badge tone={item.status === 'confirmed' ? 'green' : 'orange'}>{item.status === 'confirmed' ? 'Đã xác nhận thông tin' : 'Bản nháp'}</Badge>
          </div>)}
        </section>
        {doc.note && <p className="text-xs text-slate-600"><strong>Ghi chú:</strong> {doc.note}</p>}
      </div>
    </Modal>
  );
}
