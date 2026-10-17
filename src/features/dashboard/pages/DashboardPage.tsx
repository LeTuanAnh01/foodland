import * as React from 'react';
import { ChartNoAxesCombined, ClipboardCheck, Package, ShoppingCart, TriangleAlert } from 'lucide-react';
import { DateFilter, MetricCard } from '@/components/shared';
import { useFoodland } from '@/data/store';
import { EMPTY_DATE_FILTER } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { money } from '@/lib/utils';
import { businessSummary } from '@/features/reports/utils/reportMetrics';
import { RevenueChart } from '../components/RevenueChart';
import { StockAlerts } from '../components/StockAlerts';
import { RecentStockMovements } from '../components/RecentStockMovements';
import { TopSellingProducts } from '../components/TopSellingProducts';

export function DashboardPage() {
  const { db } = useFoodland();
  const [period, setPeriod] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const summary = businessSummary(db, period);
  const alerts = db.stocks.filter((stock) => stock.quantity <= stock.min).length;
  const pendingMovements = db.stockMovements.filter((movement) => movement.status === 'draft').length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#e6ede7] bg-white px-4 py-3">
        <DateFilter value={period} onChange={setPeriod} label="Kỳ thống kê chứng từ" />
        <span className="text-[11px] text-[#7b9083]">Chỉ tính chứng từ đã xác nhận theo ngày chứng từ</span>
      </div>

      <div className="mb-[17px] grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Giá trị chứng từ bán đã xác nhận"
          value={money(summary.sellValue)}
          note={`${summary.sellCount} chứng từ · Không phải doanh thu kế toán`}
          icon={<ChartNoAxesCombined size={20} />}
        />
        <MetricCard
          label="Giá trị chứng từ mua đã xác nhận"
          value={money(summary.buyValue)}
          note={`${summary.buyCount} chứng từ · Chưa phản ánh thanh toán`}
          icon={<ShoppingCart size={20} />}
          tone="orange"
        />
        <MetricCard
          label="Hàng dưới hoặc bằng ngưỡng tồn"
          value={String(alerts)}
          note="Theo tồn kho hiện tại, không phụ thuộc kỳ lọc"
          icon={<TriangleAlert size={20} />}
          tone="blue"
        />
        <MetricCard
          label="Phiếu kho chờ xác nhận"
          value={String(pendingMovements)}
          note={`${db.products.length} mặt hàng trong danh mục`}
          icon={<ClipboardCheck size={20} />}
          tone="purple"
        />
      </div>

      <div className="mb-[17px] grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <RevenueChart />
        <StockAlerts />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RecentStockMovements />
        <TopSellingProducts period={period} />
      </div>
      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#85988a]">
        <Package size={13} className="mt-0.5 shrink-0" />
        Số liệu được tính từ dữ liệu đang lưu trên trình duyệt. Giá trị chứng từ không phải doanh thu,
        lợi nhuận hay giá vốn kế toán. Tồn kho và phiếu đang chờ là trạng thái hiện tại, không lọc theo ngày.
      </p>
    </>
  );
}
