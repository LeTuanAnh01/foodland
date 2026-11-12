import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { DateFilter, EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { EMPTY_DATE_FILTER, matchesDateFilter } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { useFoodland } from '@/data/store';
import { dateVN } from '@/lib/utils';

export function StockChecksTable() {
  const { db } = useFoodland();
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const visible = db.stockChecks.filter((check) => matchesDateFilter(check.date, dateFilter));
  const latestDate = db.stockChecks.reduce((max, item) => item.date > max ? item.date : max, '');
  const pagination = usePagination(visible, [dateFilter]);

  return (
    <>
      <p className="px-5 py-4 text-xs text-[#87978c]">
        Phiếu kiểm kê hiện là bản nháp minh họa, chưa đối chiếu số liệu hoặc điều chỉnh tồn kho.
      </p>
      <div className="border-b border-[#e9efe9] px-5 pb-4">
        <DateFilter value={dateFilter} onChange={setDateFilter} latestDate={latestDate} label="Ngày kiểm kê" />
      </div>
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>SỐ PHIẾU</th>
              <th>NGÀY KIỂM KÊ</th>
              <th>TRẠNG THÁI</th>
              <th>GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((check) => (
              <tr key={check.id}>
                <td className="font-semibold !text-emerald-700">{check.id}</td>
                <td>{dateVN(check.date)}</td>
                <td><Badge tone="orange">{check.status}</Badge></td>
                <td className="whitespace-normal">{check.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <EmptyState />}
      </TableScroll>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
    </>
  );
}
