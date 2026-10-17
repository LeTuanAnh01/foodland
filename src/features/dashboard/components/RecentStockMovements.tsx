import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { SectionCard, TableScroll, TableFooter, usePagination } from '@/components/shared';
import { useFoodland } from '@/data/store';
import { dateVN } from '@/lib/utils';

export function RecentStockMovements() {
  const { db } = useFoodland();
  const movements = [...db.stockMovements]
    .sort((a, b) => b.date.localeCompare(a.date));

  const pagination = usePagination(movements);

  return (
    <SectionCard
      title="Nhập – xuất kho gần đây"
      subtitle="Phiếu kho gần đây · Chỉ phiếu đã xác nhận mới tác động tồn kho"
      right={
        <Link to="/inventory" className="text-xs font-semibold text-emerald-700">
          Xem tất cả →
        </Link>
      }
    >
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>CHỨNG TỪ</th>
              <th>MẶT HÀNG</th>
              <th>LOẠI</th>
              <th>SỐ LƯỢNG</th>
              <th>NGÀY</th><th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((movement) => {
              const incoming = movement.kind === 'Nhập kho';
              const firstLine = movement.lines[0];
              const product = db.products.find((item) => item.id === firstLine?.productId);
              const firstName = product?.name ?? firstLine?.productId ?? '—';
              const productLabel = movement.lines.length > 1
                ? `${firstName} (+${movement.lines.length - 1} mặt hàng)`
                : firstName;
              const quantityLabel = movement.lines.length === 1
                ? `${incoming ? '+' : '−'}${firstLine.quantity} ${product?.unit ?? ''}`
                : `${movement.lines.length} mặt hàng`;

              return (
                <tr key={movement.id}>
                  <td className="font-semibold text-[#137854]">{movement.id}</td>
                  <td>{productLabel}</td>
                  <td>
                    <Badge tone={incoming ? 'green' : 'orange'}>
                      {incoming ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {' '}{incoming ? 'Nhập' : 'Xuất'}
                    </Badge>
                  </td>
                  <td className="font-semibold">{quantityLabel}</td>
                  <td>{dateVN(movement.date)}</td>
                  <td><Badge tone={movement.status === 'confirmed' ? 'green' : 'orange'}>{movement.status === 'confirmed' ? 'Đã xác nhận' : 'Bản nháp'}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />
    </SectionCard>
  );
}
