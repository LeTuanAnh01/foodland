import * as React from 'react';
import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFoodland } from '@/data/store';
import type { StockCheck } from '@/data/types';
import { localToday, nextStockCheckId } from '../utils/movementIds';

export function StockCheckForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { db, saveStockCheck } = useFoodland();
  const [draft, setDraft] = React.useState<StockCheck>(() => ({
    id: nextStockCheckId(db.stockChecks),
    date: localToday(),
    status: 'Bản nháp',
    note: '',
  }));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.date || db.stockChecks.some((item) => item.id === draft.id)) return;
    saveStockCheck({ ...draft, note: draft.note.trim() });
    onSaved();
  }

  return (
    <Modal
      title="Tạo phiếu kiểm kê mẫu"
      subtitle="Lưu bản nháp để duyệt giao diện, chưa có đối chiếu chênh lệch thực tế."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="stock-check-form">Tạo phiếu mẫu</Button>
        </>
      }
    >
      <form id="stock-check-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Số phiếu">
          <Input value={draft.id} disabled />
        </FormField>
        <FormField label="Ngày kiểm kê *">
          <Input
            type="date"
            required
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Ghi chú">
            <textarea
              className="field-select min-h-24 resize-y py-2"
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              placeholder="Ví dụ: Kiểm kê thử tại kho chính"
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
