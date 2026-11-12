import * as React from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { SectionCard } from '@/components/shared';
import { useFoodland } from '@/data/store';
import { money } from '@/lib/utils';
import { monthlyBusinessTotals, reportYears } from '@/features/reports/utils/reportMetrics';

export function RevenueChart() {
  const { db } = useFoodland();
  const years = reportYears(db);
  const [year, setYear] = React.useState(() => years[0]);
  const selectedYear = years.includes(year) ? year : years[0];
  const chart = monthlyBusinessTotals(db, selectedYear);
  const hasValues = chart.some((item) => item.buy !== 0 || item.sell !== 0);

  return (
    <SectionCard
      title="Giá trị chứng từ mua và bán theo tháng"
      subtitle="Chỉ chứng từ đã xác nhận · Đơn vị VND · Theo năm được chọn"
      right={
        <label className="flex items-center gap-2 text-xs text-slate-600">
          Năm
          <select
            aria-label="Năm hiển thị biểu đồ"
            value={selectedYear}
            onChange={(event) => setYear(Number(event.target.value))}
            className="rounded-lg border border-[#dce7df] bg-white px-2 py-1.5 text-xs"
          >
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      }
    >
      {hasValues ? (
        <div className="h-[290px] px-3 pb-4 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} barGap={3} barSize={11}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaf0ea" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#91a095' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={54}
                tick={{ fontSize: 10, fill: '#91a095' }}
                tickFormatter={(value: number) => `${Number((value / 1_000_000).toFixed(1))}tr`}
              />
              <Tooltip formatter={(value) => money(Number(value))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="sell" name="Chứng từ bán" fill="#126b50" radius={[3, 3, 0, 0]} />
              <Bar dataKey="buy" name="Chứng từ mua" fill="#86cdb1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="px-5 py-16 text-center text-xs text-slate-500">Không có chứng từ đã xác nhận trong năm {selectedYear}.</p>
      )}
    </SectionCard>
  );
}
