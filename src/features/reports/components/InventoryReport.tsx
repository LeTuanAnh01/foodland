import * as React from 'react';
import { Download } from 'lucide-react';
import {
  DateFilter, EmptyState, SearchInput, TableFooter, TableScroll, usePagination,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DB } from '@/data/types';
import { EMPTY_DATE_FILTER } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { compact, downloadCsv } from '@/lib/utils';
import { confirmedMovements, inventoryActivityByProduct } from '../utils/reportMetrics';

type StockFilter = 'all' | 'low' | 'zero';

export function InventoryReport({ db }: { db: DB }) {
  const [query, setQuery] = React.useState('');
  const [stockFilter, setStockFilter] = React.useState<StockFilter>('all');
  const [period, setPeriod] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const activity = inventoryActivityByProduct(db, period);
  const confirmed = confirmedMovements(db, period);
  const rows = db.stocks
    .map((stock) => {
      const product = db.products.find((item) => item.id === stock.productId);
      const flow = activity.get(stock.productId) ?? { received: 0, issued: 0 };
      return { ...stock, name: product?.name ?? stock.productId, unit: product?.unit ?? '', ...flow };
    })
    .filter((row) => {
      if (stockFilter === 'low' && row.quantity > row.min) return false;
      if (stockFilter === 'zero' && row.quantity !== 0) return false;
      return `${row.productId} ${row.name} ${row.location}`.toLowerCase().includes(query.trim().toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const pagination = usePagination(rows, [query, stockFilter, period]);
  const receivedCount = confirmed.filter((movement) => movement.kind === 'Nhập kho').length;
  const issuedCount = confirmed.filter((movement) => movement.kind === 'Xuất kho').length;
  const lowCount = db.stocks.filter((stock) => stock.quantity <= stock.min).length;

  return (
    <>
      <div className="space-y-3 p-5 pb-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <DateFilter value={period} onChange={setPeriod} label="Kỳ phát sinh nhập/xuất" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadCsv(
              'foodland-bao-cao-kho.csv',
              ['Mã hàng', 'Mặt hàng', 'Đơn vị', 'Kho', 'Tồn hiện tại', 'Ngưỡng tối thiểu', 'Nhập đã xác nhận trong kỳ', 'Xuất đã xác nhận trong kỳ', 'Cảnh báo'],
              rows.map((row) => [
                row.productId, row.name, row.unit, row.location, row.quantity,
                row.min, row.received, row.issued,
                row.quantity === 0 ? 'Hết hàng' : row.quantity <= row.min ? 'Dưới ngưỡng' : 'Bình thường',
              ]),
            )}
          >
            <Download size={15} /> Xuất CSV đầy đủ theo bộ lọc
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] text-slate-600">
            Tình trạng tồn hiện tại
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
              className="h-9 rounded-lg border border-[#dce7df] bg-white px-3 text-xs"
            >
              <option value="all">Tất cả mặt hàng</option>
              <option value="low">Dưới hoặc bằng ngưỡng</option>
              <option value="zero">Hết hàng</option>
            </select>
          </label>
          <SearchInput value={query} onChange={setQuery} placeholder="Tìm mặt hàng, mã hàng, kho..." />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-[11px] text-emerald-800">Phiếu nhập đã xác nhận trong kỳ</p>
            <strong className="mt-1 block text-lg text-emerald-900">{receivedCount}</strong>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-[11px] text-orange-800">Phiếu xuất đã xác nhận trong kỳ</p>
            <strong className="mt-1 block text-lg text-orange-900">{issuedCount}</strong>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-600">Mặt hàng dưới hoặc bằng ngưỡng (hiện tại)</p>
            <strong className="mt-1 block text-lg text-slate-800">{lowCount}</strong>
          </div>
        </div>
        <p className="text-[11px] leading-5 text-slate-500">
          Tồn hiện tại là số tồn mới nhất, không phải tồn cuối kỳ lịch sử. Số nhập/xuất được cộng theo từng mặt hàng từ phiếu đã xác nhận trong kỳ.
          Các phiếu cũ chưa áp dụng kho (nếu có) vẫn xuất hiện trong lịch sử phiếu nhưng không thể dùng để suy ra tồn đầu kỳ.
        </p>
      </div>
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>MÃ HÀNG</th>
              <th>TÊN HÀNG</th>
              <th>ĐƠN VỊ</th>
              <th>KHO</th>
              <th>TỒN HIỆN TẠI</th>
              <th>NGƯỠNG TỐI THIỂU</th>
              <th>NHẬP TRONG KỲ</th>
              <th>XUẤT TRONG KỲ</th>
              <th>CẢNH BÁO</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((row) => (
              <tr key={row.productId}>
                <td>{row.productId}</td>
                <td className="font-semibold">{row.name}</td>
                <td>{row.unit}</td>
                <td>{row.location}</td>
                <td className="!font-bold">{compact(row.quantity)}</td>
                <td>{compact(row.min)}</td>
                <td className="text-emerald-700">{compact(row.received)}</td>
                <td className="text-orange-700">{compact(row.issued)}</td>
                <td>
                  <Badge tone={row.quantity === 0 ? 'red' : row.quantity <= row.min ? 'orange' : 'green'}>
                    {row.quantity === 0 ? 'Hết hàng' : row.quantity <= row.min ? 'Dưới ngưỡng' : 'Bình thường'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState text="Không có mặt hàng phù hợp với bộ lọc." />}
      </TableScroll>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
    </>
  );
}
