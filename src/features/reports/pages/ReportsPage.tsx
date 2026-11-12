import * as React from 'react';
import { Info } from 'lucide-react';
import { SectionCard, Tabs } from '@/components/shared';
import { useFoodland } from '@/data/store';
import { PurchaseSalesReport } from '../components/PurchaseSalesReport';
import { InventoryReport } from '../components/InventoryReport';
import { PendingReports } from '../components/PendingReports';

type ReportTab = 'buy-sell' | 'inventory' | 'accounting';

export function ReportsPage() {
  const { db } = useFoodland();
  const [tab, setTab] = React.useState<ReportTab>('buy-sell');

  return (
    <>
      <SectionCard
        title="Báo cáo quản trị Foodland"
        subtitle="Tổng hợp trực tiếp từ chứng từ, phiếu kho và số tồn trong trình duyệt"
      >
        <Tabs
          active={tab}
          onChange={(id) => setTab(id as ReportTab)}
          items={[
            { id: 'buy-sell', label: 'Giá trị chứng từ mua – bán' },
            { id: 'inventory', label: 'Tồn kho & nhập xuất' },
            { id: 'accounting', label: 'Chưa triển khai' },
          ]}
        />
        {tab === 'buy-sell'
          ? <PurchaseSalesReport db={db} />
          : tab === 'inventory'
            ? <InventoryReport db={db} />
            : <PendingReports />}
      </SectionCard>
      <p className="mt-5 flex gap-2 text-xs leading-5 text-[#8b998f]">
        <Info size={15} className="mt-0.5 shrink-0" />
        Báo cáo quản trị lấy dữ liệu thực từ bản demo, không thay thế báo cáo kế toán hoặc thuế.
        Không tính doanh thu, lãi lỗ, công nợ hay giá trị tồn kho khi chưa có quy tắc hạch toán và giá vốn.
      </p>
    </>
  );
}
