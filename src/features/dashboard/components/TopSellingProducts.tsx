import { Activity } from 'lucide-react';
import { SectionCard } from '@/components/shared';
import { useFoodland } from '@/data/store';
import { topProductsFromSalesDocs } from '@/features/reports/utils/reportMetrics';
import type { DateFilterValue } from '@/lib/dateFilter';
import { compact } from '@/lib/utils';

export function TopSellingProducts({ period }: { period: DateFilterValue }) {
  const { db } = useFoodland();
  const items = topProductsFromSalesDocs(db, period);
  const largest = Math.max(1, ...items.map((item) => item.quantity));

  return (
    <SectionCard
      title="Top mặt hàng theo chứng từ bán"
      subtitle="Số lượng trên chứng từ đã xác nhận, chưa phải lượng giao thực tế"
      right={<Activity size={16} className="text-emerald-700" />}
    >
      <div className="space-y-4 px-5 pb-5">
        {items.length === 0 && (
          <p className="py-5 text-center text-xs text-slate-500">Chưa có chứng từ bán đã xác nhận trong kỳ.</p>
        )}
        {items.map((item, index) => {
          const product = db.products.find((entry) => entry.id === item.productId);
          return (
            <div key={item.productId} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#eaf7ef] text-xs font-bold text-[#10865b]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex justify-between gap-2">
                  <strong className="truncate text-[12px]">{product?.name ?? item.productId}</strong>
                  <span className="shrink-0 text-[11px] text-[#82928a]">
                    {compact(item.quantity)} {product?.unit ?? ''}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#edf3ef]">
                  <div
                    className="h-full rounded-full bg-[#159b6a]"
                    style={{ width: `${(item.quantity / largest) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
