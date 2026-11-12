import * as React from 'react';
import { Download } from 'lucide-react';
import {
  DateFilter, EmptyState, SearchInput, TableFooter, TableScroll, usePagination,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DB, DocKind } from '@/data/types';
import { EMPTY_DATE_FILTER, matchesDateFilter } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { dateVN, downloadCsv, money } from '@/lib/utils';
import { documentAmount } from '../utils/reportMetrics';

type DocumentStatus = 'all' | 'Bản nháp' | 'Đã xác nhận';

export function PurchaseSalesReport({ db }: { db: DB }) {
  const [kind, setKind] = React.useState<'all' | DocKind>('all');
  const [status, setStatus] = React.useState<DocumentStatus>('Đã xác nhận');
  const [query, setQuery] = React.useState('');
  const [period, setPeriod] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });

  const partner = (id: string) => db.partners.find((item) => item.id === id)?.name ?? '—';
  const records = db.docs
    .filter((doc) => {
      if (kind !== 'all' && doc.kind !== kind) return false;
      if (status !== 'all' && doc.status !== status) return false;
      if (!matchesDateFilter(doc.date, period)) return false;
      const products = doc.lines
        .map((line) => db.products.find((item) => item.id === line.productId)?.name ?? line.productId)
        .join(' ');
      return `${doc.id} ${partner(doc.partnerId)} ${products}`.toLowerCase().includes(query.trim().toLowerCase());
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const pagination = usePagination(records, [kind, status, query, period]);
  const buy = records.filter((doc) => doc.kind === 'buy');
  const sell = records.filter((doc) => doc.kind === 'sell');
  const sum = (docs: typeof records) => docs.reduce((total, doc) => total + documentAmount(doc), 0);
  const confirmedCount = records.filter((doc) => doc.status === 'Đã xác nhận').length;

  return (
    <>
      <div className="space-y-3 p-5 pb-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <DateFilter value={period} onChange={setPeriod} label="Ngày chứng từ" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadCsv(
              'foodland-bao-cao-gia-tri-chung-tu.csv',
              ['Loại', 'Ngày chứng từ', 'Mã chứng từ', 'Đối tác', 'Trạng thái', 'Giá trị chứng từ'],
              records.map((doc) => [
                doc.kind === 'buy' ? 'MUA' : 'BÁN', doc.date, doc.id,
                partner(doc.partnerId), doc.status, documentAmount(doc),
              ]),
            )}
          >
            <Download size={15} /> Xuất CSV đầy đủ theo bộ lọc
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] text-slate-600">
            Loại chứng từ
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as 'all' | DocKind)}
              className="h-9 rounded-lg border border-[#dce7df] bg-white px-3 text-xs"
            >
              <option value="all">Tất cả mua – bán</option>
              <option value="buy">Mua hàng</option>
              <option value="sell">Bán hàng</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-slate-600">
            Trạng thái chứng từ
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as DocumentStatus)}
              className="h-9 rounded-lg border border-[#dce7df] bg-white px-3 text-xs"
            >
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Bản nháp">Bản nháp</option>
              <option value="all">Tất cả trạng thái</option>
            </select>
          </label>
          <SearchInput value={query} onChange={setQuery} placeholder="Tìm chứng từ, đối tác, mặt hàng..." />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-[11px] text-emerald-800">Giá trị chứng từ bán đang lọc</p>
            <strong className="mt-1 block text-lg text-emerald-900">{money(sum(sell))}</strong>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-[11px] text-orange-800">Giá trị chứng từ mua đang lọc</p>
            <strong className="mt-1 block text-lg text-orange-900">{money(sum(buy))}</strong>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-600">Số chứng từ trong kết quả</p>
            <strong className="mt-1 block text-lg text-slate-800">{records.length}</strong>
            <p className="text-[11px] text-slate-500">{confirmedCount} đã xác nhận</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Các tổng này phản ánh bộ lọc hiện tại. Nếu chọn cả bản nháp, giá trị nháp cũng được tính và không phải số đã duyệt.
        </p>
      </div>
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>LOẠI GIAO DỊCH</th>
              <th>NGÀY</th>
              <th>SỐ CHỨNG TỪ</th>
              <th>ĐỐI TÁC</th>
              <th>HÀNG HÓA</th>
              <th>TRẠNG THÁI</th>
              <th>GIÁ TRỊ CHỨNG TỪ</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((doc) => (
              <tr key={doc.id}>
                <td><Badge tone={doc.kind === 'buy' ? 'blue' : 'green'}>{doc.kind === 'buy' ? 'MUA HÀNG' : 'BÁN HÀNG'}</Badge></td>
                <td>{dateVN(doc.date)}</td>
                <td className="!font-bold !text-[#16845b]">{doc.id}</td>
                <td>{partner(doc.partnerId)}</td>
                <td>{doc.lines.map((line) => db.products.find((product) => product.id === line.productId)?.name ?? line.productId).join(', ')}</td>
                <td><Badge tone={doc.status === 'Đã xác nhận' ? 'green' : 'orange'}>{doc.status}</Badge></td>
                <td className="!font-bold">{money(documentAmount(doc))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <EmptyState text="Không có chứng từ phù hợp với bộ lọc." />}
      </TableScroll>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
    </>
  );
}
