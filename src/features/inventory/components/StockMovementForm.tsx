import * as React from 'react';
import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFoodland } from '@/data/store';
import type {
  StockMovementKind,
  StockMovementLine,
  StockMovementV2,
} from '@/data/types';
import { documentQuantities, validateLinkedMovement } from '@/features/documents/utils/documentWorkflow';
import type { BusinessDoc } from '@/data/types';
import { localToday, nextMovementId } from '../utils/movementIds';
import { StockMovementLinesEditor } from './StockMovementLinesEditor';

type Props = {
  kind: StockMovementKind;
  onClose: () => void;
  onSaved: () => void;
  movement?: StockMovementV2;
  sourceDoc?: BusinessDoc;
};

type MovementDraft = Pick<StockMovementV2, 'id' | 'date' | 'kind' | 'note'>;

export function StockMovementForm({ kind, onClose, onSaved, movement, sourceDoc }: Props) {
  const { db, saveStockMovement } = useFoodland();
  const isEdit = Boolean(movement);
  const linkedDoc = db.docs.find((item) => item.id === (movement?.sourceDocId ?? sourceDoc?.id));
  const remaining = linkedDoc ? documentQuantities(db, linkedDoc, movement?.id) : [];
  const validProducts = linkedDoc
    ? db.products.filter((product) => remaining.some((row) => row.productId === product.id))
    : db.products;
  const [draft, setDraft] = React.useState<MovementDraft>(() => ({
    id: movement?.id ?? nextMovementId(db.stockMovements, kind),
    date: movement?.date ?? localToday(),
    kind,
    note: movement?.note ?? '',
  }));
  const [lines, setLines] = React.useState<StockMovementLine[]>(() =>
    movement?.lines.map((line) => ({ ...line })) ??
    (sourceDoc
      ? documentQuantities(db, sourceDoc)
          .filter((row) => row.available > 0)
          .map((row) => ({ productId: row.productId, quantity: row.available }))
      : [{ productId: '', quantity: 1 }]),
  );
  const [error, setError] = React.useState('');

  function update(patch: Partial<MovementDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError('');
  }

  function updateLines(nextLines: StockMovementLine[]) {
    setLines(nextLines);
    setError('');
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = draft.id.trim().toUpperCase();

    if (movement?.status === 'confirmed') {
      setError('Phiếu đã xác nhận không thể chỉnh sửa.');
      return;
    }
    if (!id) {
      setError('Vui lòng nhập mã phiếu.');
      return;
    }
    if (db.stockMovements.some((item) => item.id.toUpperCase() === id && item.id !== movement?.id)) {
      setError('Mã phiếu đã tồn tại.');
      return;
    }
    if (!draft.date || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      setError('Vui lòng chọn ngày phiếu hợp lệ.');
      return;
    }
    if (!lines.length) {
      setError('Phiếu phải có ít nhất một mặt hàng.');
      return;
    }
    if (
      lines.some(
        (line) =>
          !db.products.some((product) => product.id === line.productId) ||
          !Number.isFinite(line.quantity) ||
          line.quantity <= 0,
      )
    ) {
      setError('Vui lòng chọn mặt hàng và nhập số lượng lớn hơn 0.');
      return;
    }
    const ids = lines.map((line) => line.productId);
    if (new Set(ids).size !== ids.length) {
      setError('Một mặt hàng không được xuất hiện hai lần.');
      return;
    }

    const candidate: StockMovementV2 = {
      id,
      date: draft.date,
      kind,
      status: 'draft',
      sourceDocId: linkedDoc?.id,
      note: draft.note.trim(),
      lines: lines.map((line) => ({ ...line })),
    };
    const linkedCheck = validateLinkedMovement(db, candidate, movement?.id);
    if (!linkedCheck.ok) {
      setError(linkedCheck.message);
      return;
    }
    const result = saveStockMovement(candidate);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSaved();
  }

  return (
    <Modal
      wide
      title={`${isEdit ? 'Chỉnh sửa' : 'Tạo'} phiếu ${kind.toLowerCase()}`}
      subtitle={linkedDoc
        ? `Phiếu được lập từ chứng từ ${linkedDoc.id}. Chỉ xác nhận phiếu mới cập nhật tồn.`
        : 'Phiếu kho trực tiếp. Lưu bản nháp không đổi tồn; xác nhận mới cập nhật kho.'}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="stock-movement-form">
            {isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </Button>
        </>
      }
    >
      <form id="stock-movement-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {linkedDoc && (
          <div className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <strong>Chứng từ liên kết: {linkedDoc.id}</strong>
            <p className="mt-1">Có thể điều chỉnh số lượng cho từng đợt giao nhận. Tổng số lượng của tất cả phiếu không được vượt chứng từ.</p>
          </div>
        )}
        <FormField label="Ngày phiếu *">
          <Input
            type="date"
            required
            value={draft.date}
            onChange={(event) => update({ date: event.target.value })}
          />
        </FormField>
        <FormField label="Mã phiếu *">
          <Input
            required
            readOnly={isEdit}
            className={isEdit ? 'bg-gray-50' : undefined}
            value={draft.id}
            onChange={(event) => update({ id: event.target.value })}
          />
        </FormField>

        <StockMovementLinesEditor
          products={validProducts}
          stocks={db.stocks}
          kind={kind}
          lines={lines}
          onChange={updateLines}
        />

        {linkedDoc && (
          <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="mb-2 font-semibold">Số lượng còn có thể lập phiếu (đã trừ các phiếu nháp khác)</p>
            <div className="flex flex-wrap gap-2">
              {remaining.map((row) => (
                <span key={row.productId} className="rounded-md bg-white px-2 py-1">
                  {db.products.find((product) => product.id === row.productId)?.name ?? row.productId}: <strong>{row.available}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="sm:col-span-2">
          <FormField label="Ghi chú">
            <textarea
              className="field-select min-h-24 resize-y py-2"
              value={draft.note}
              onChange={(event) => update({ note: event.target.value })}
              placeholder="Diễn giải nội dung nhập/xuất kho..."
            />
          </FormField>
        </div>

        {error && (
          <p role="alert" className="sm:col-span-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
