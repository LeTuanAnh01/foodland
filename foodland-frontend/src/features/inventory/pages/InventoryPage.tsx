import * as React from 'react';
import { Plus } from 'lucide-react';
import { SectionCard, Tabs } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useFoodland } from '@/data/store';
import type { Stock, StockMovementKind } from '@/data/types';
import { InventoryOverview } from '../components/InventoryOverview';
import { StockEditor } from '../components/StockEditor';
import { StockMovementForm } from '../components/StockMovementForm';
import { StockMovementsTable } from '../components/StockMovementsTable';
import { StockCheckForm } from '../components/StockCheckForm';
import { StockChecksTable } from '../components/StockChecksTable';

type InventoryTab = 'overview' | 'receipts' | 'issues' | 'count';

const inventoryTabs = [
  { id: 'overview', label: 'Tổng quan tồn kho' },
  { id: 'receipts', label: 'Nhập kho' },
  { id: 'issues', label: 'Xuất kho' },
  { id: 'count', label: 'Kiểm kê' },
];

function movementKind(tab: InventoryTab): StockMovementKind | null {
  if (tab === 'receipts') return 'Nhập kho';
  if (tab === 'issues') return 'Xuất kho';
  return null;
}

export function InventoryPage() {
  const { db, saveStock } = useFoodland();
  const [tab, setTab] = React.useState<InventoryTab>('overview');
  const [editing, setEditing] = React.useState<Stock | null>(null);
  const [creating, setCreating] = React.useState(false);

  const receiptDraftCount = db.stockMovements.filter((item) => item.kind === 'Nhập kho' && item.status === 'draft').length;
  const issueDraftCount = db.stockMovements.filter((item) => item.kind === 'Xuất kho' && item.status === 'draft').length;
  const tabsWithAttention = inventoryTabs.map((item) => {
    const pending = item.id === 'receipts' ? receiptDraftCount : item.id === 'issues' ? issueDraftCount : 0;
    return pending > 0 ? { ...item, label: `${item.label} · ${pending} chờ xác nhận` } : item;
  });
  const kind = movementKind(tab);
  const actionText = kind ? `Thêm phiếu ${kind.toLowerCase()}` : 'Tạo phiếu kiểm kê';

  return (
    <>
      <SectionCard
        title="Kho"
        subtitle="Xác nhận phiếu kho sẽ cập nhật tồn kho mô phỏng; hỗ trợ phiếu trực tiếp và phiếu từ chứng từ."
        right={
          tab !== 'overview' && (
            <Button onClick={() => setCreating(true)}>
              <Plus /> {actionText}
            </Button>
          )
        }
      >
        <Tabs
          active={tab}
          onChange={(id) => setTab(id as InventoryTab)}
          items={tabsWithAttention}
        />

        {tab === 'overview' && (
          <InventoryOverview
            stocks={db.stocks}
            products={db.products}
            onEdit={setEditing}
          />
        )}
        {kind && <StockMovementsTable key={kind} kind={kind} />}
        {tab === 'count' && <StockChecksTable />}
      </SectionCard>

      {editing && (
        <StockEditor
          stock={editing}
          name={db.products.find((product) => product.id === editing.productId)?.name}
          onChange={setEditing}
          onSave={saveStock}
          onClose={() => setEditing(null)}
        />
      )}

      {creating && kind && (
        <StockMovementForm
          kind={kind}
          onClose={() => setCreating(false)}
          onSaved={() => setCreating(false)}
        />
      )}
      {creating && tab === 'count' && (
        <StockCheckForm
          onClose={() => setCreating(false)}
          onSaved={() => setCreating(false)}
        />
      )}
    </>
  );
}
