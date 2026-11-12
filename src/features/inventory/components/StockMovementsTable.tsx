import * as React from 'react';
import { AlertTriangle, CheckCircle2, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { DateFilter, EmptyState, SearchInput, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { EMPTY_DATE_FILTER, matchesDateFilter } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { useFoodland } from '@/data/store';
import type { StockMovementKind } from '@/data/types';
import { dateVN, downloadCsv } from '@/lib/utils';
import { checkStockMovement } from '../utils/stockConfirmation';
import { validateLinkedMovement } from '@/features/documents/utils/documentWorkflow';
import { StockMovementForm } from './StockMovementForm';

type Props = { kind: StockMovementKind };

const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 6 });

export function StockMovementsTable({ kind }: Props) {
  const { db, deleteStockMovement, confirmStockMovement } = useFoodland();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'draft' | 'confirmed'>('all');
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState('');
  const [notice, setNotice] = React.useState('');

  const productById = (id: string) => db.products.find((product) => product.id === id);
  const stockById = (id: string) => db.stocks.find((stock) => stock.productId === id);
  const all = db.stockMovements.filter((movement) => movement.kind === kind);
  const keyword = search.trim().toLowerCase();
  const latestDate = all.reduce((max, item) => item.date > max ? item.date : max, '');
  const visible = all.filter((movement) => {
    if (statusFilter !== 'all' && movement.status !== statusFilter) return false;
    if (!matchesDateFilter(movement.date, dateFilter)) return false;
    const productText = movement.lines
      .map((line) => `${line.productId} ${productById(line.productId)?.name ?? ''}`)
      .join(' ');
    return `${movement.id} ${movement.note} ${productText}`.toLowerCase().includes(keyword);
  }).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'draft' ? -1 : 1;
    return a.date === b.date ? b.id.localeCompare(a.id) : a.date.localeCompare(b.date);
  });

  const selected = db.stockMovements.find((item) => item.id === selectedId);
  const listPages = usePagination(visible, [search, statusFilter, dateFilter]);
  const detailPages = usePagination(selected?.lines ?? [], [selectedId]);
  const selectedCheck = selected?.status === 'draft' ? checkStockMovement(selected, db) : null;
  const editing = db.stockMovements.find((item) => item.id === editingId);
  const deleting = db.stockMovements.find((item) => item.id === deletingId);
  const confirming = db.stockMovements.find((item) => item.id === confirmingId);
  const confirmationPages = usePagination(confirming?.lines ?? [], [confirmingId]);
  const confirmationCheck = confirming ? checkStockMovement(confirming, db) : null;
  const linkedCheck = confirming ? validateLinkedMovement(db, confirming, confirming.id) : null;

  function exportCsv() {
    downloadCsv(
      kind === 'Nhập kho' ? 'foodland-phieu-nhap-kho.csv' : 'foodland-phieu-xuat-kho.csv',
      ['Mã phiếu', 'Ngày', 'Loại', 'Trạng thái', 'Chứng từ gốc', 'Mã hàng', 'Mặt hàng', 'Số lượng', 'Đơn vị', 'Diễn giải'],
      visible.flatMap((movement) =>
        movement.lines.map((line) => {
          const product = productById(line.productId);
          return [
            movement.id,
            movement.date,
            movement.kind,
            movement.status === 'draft' ? 'Bản nháp' : 'Đã xác nhận',
            movement.sourceDocId ?? '',
            line.productId,
            product?.name ?? '',
            line.quantity,
            product?.unit ?? '',
            movement.note,
          ];
        }),
      ),
    );
  }

  function openConfirmation(id: string) {
    setConfirmError('');
    setConfirmingId(id);
  }

  function confirm() {
    if (!confirming) return;
    // Store tính lại từ trạng thái mới nhất trước khi trừ/cộng kho.
    const result = confirmStockMovement(confirming.id);
    if (!result.ok) {
      setConfirmError(result.message);
      return;
    }
    setNotice(`Đã xác nhận ${confirming.id} và ${confirming.kind === 'Nhập kho' ? 'cộng' : 'trừ'} tồn kho thành công.`);
    setConfirmingId(null);
    setConfirmError('');
  }

  return (
    <>
      <p className="px-5 pt-4 text-xs text-[#87978c]">
        Phiếu kho có thể tạo trực tiếp hoặc từ chứng từ mua/bán. Lưu bản nháp không thay đổi tồn;
        <strong> xác nhận phiếu mới cộng/trừ số tồn kho.</strong> Phiếu xuất phải đủ tồn ở mọi mặt hàng.
      </p>

      {notice && (
        <div role="status" className="mx-5 mt-3 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {notice}</span>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setNotice('')} className="font-semibold">Đóng</button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm mã phiếu, mặt hàng, diễn giải..."
          className="max-w-[350px]"
        />
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
            Trạng thái phiếu
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'draft' | 'confirmed')}
              className="h-9 rounded-lg border border-[#dce7df] bg-white px-3 text-xs text-slate-700">
              <option value="all">Tất cả phiếu</option>
              <option value="draft">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </label>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download /> Xuất CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-[#e9efe9] px-5 pb-4">
        <DateFilter value={dateFilter} onChange={setDateFilter} latestDate={latestDate} label="Ngày phiếu kho" />
      </div>
      <p className="px-5 py-3 text-[11px] text-slate-500">
        {all.filter((item) => item.status === 'draft').length} phiếu đang chờ xác nhận trên toàn bộ danh sách
        · Đang hiển thị {visible.length} phiếu sau lọc · Phiếu nháp ưu tiên lên đầu.
      </p>
      <TableScroll>
        <table className="data-table">
          <thead>
            <tr>
              <th>MÃ PHIẾU</th>
              <th>NGÀY</th>
              <th>MẶT HÀNG</th>
              <th>LOẠI</th>
              <th>SỐ LƯỢNG</th>
              <th>TRẠNG THÁI</th>
              <th>CHỨNG TỪ GỐC</th>
              <th>TÌNH TRẠNG KHO</th>
              <th>DIỄN GIẢI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {listPages.items.map((movement) => {
              const firstLine = movement.lines[0];
              const firstProduct = firstLine ? productById(firstLine.productId) : undefined;
              const productName = firstProduct?.name ?? firstLine?.productId ?? '—';
              const nameLabel = movement.lines.length > 1
                ? `${productName} (+${movement.lines.length - 1} mặt hàng)`
                : productName;
              const quantityLabel = movement.lines.length === 1
                ? `${number(firstLine.quantity)} ${firstProduct?.unit ?? ''}`
                : `${movement.lines.length} mặt hàng`;
              const isDraft = movement.status === 'draft';
              const issueCheck = isDraft && movement.kind === 'Xuất kho'
                ? checkStockMovement(movement, db)
                : null;

              return (
                <tr key={movement.id}>
                  <td className="font-semibold !text-emerald-700">{movement.id}</td>
                  <td>{dateVN(movement.date)}</td>
                  <td className="max-w-72 whitespace-normal font-semibold">{nameLabel}</td>
                  <td>
                    <Badge tone={movement.kind === 'Nhập kho' ? 'green' : 'orange'}>
                      {movement.kind}
                    </Badge>
                  </td>
                  <td className="font-semibold">{quantityLabel}</td>
                  <td>
                    <Badge tone={isDraft ? 'orange' : 'green'}>
                      {isDraft ? 'Bản nháp' : 'Đã xác nhận'}
                    </Badge>
                  </td>
                  <td>{movement.sourceDocId
                    ? <Badge tone="blue">{movement.sourceDocId}</Badge>
                    : <span className="text-xs text-slate-400">Trực tiếp</span>}
                  </td>
                  <td>
                    {issueCheck ? (
                      issueCheck.errors.length > 0 ? (
                        <Badge tone="red">Cần kiểm tra</Badge>
                      ) : issueCheck.shortages.length > 0 ? (
                        <Badge tone="red">Thiếu {issueCheck.shortages.length} mặt hàng</Badge>
                      ) : (
                        <Badge tone="green">Đủ tồn</Badge>
                      )
                    ) : movement.status === 'confirmed' ? (
                      movement.stockApplied ? <Badge tone="green">Đã cập nhật</Badge> : <Badge tone="gray">Phiếu cũ</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="max-w-48 truncate" title={movement.note}>
                    {movement.note || '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Xem chi tiết" aria-label={`Xem ${movement.id}`} onClick={() => setSelectedId(movement.id)}>
                        <Eye size={15} />
                      </Button>
                      {isDraft && (
                        <>
                          <Button variant="ghost" size="icon" title="Sửa phiếu nháp" aria-label={`Sửa ${movement.id}`} onClick={() => setEditingId(movement.id)}>
                            <Pencil size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" title="Xác nhận phiếu" aria-label={`Xác nhận ${movement.id}`} onClick={() => openConfirmation(movement.id)}>
                            <CheckCircle2 size={15} />
                          </Button>
                          <Button variant="destructive" size="icon" title="Xóa phiếu nháp" aria-label={`Xóa ${movement.id}`} onClick={() => setDeletingId(movement.id)}>
                            <Trash2 size={15} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && <EmptyState />}
      </TableScroll>
      <TableFooter total={listPages.total} page={listPages.page} onPageChange={listPages.setPage} />

      {selected && (
        <Modal
          wide
          title={`Chi tiết phiếu ${selected.id}`}
          subtitle={selected.status === 'draft'
            ? 'Số tồn và tình trạng mặt hàng được đối chiếu theo dữ liệu kho hiện tại.'
            : 'Phiếu đã xác nhận: số tồn hiện tại có thể đã thay đổi kể từ thời điểm xác nhận.'}
          onClose={() => setSelectedId(null)}
          footer={
            <>
              {selected.status === 'draft' && (
                <Button variant="outline" onClick={() => { setEditingId(selected.id); setSelectedId(null); }}>
                  <Pencil size={15} /> Sửa phiếu
                </Button>
              )}
              <Button onClick={() => setSelectedId(null)}>Đóng</Button>
            </>
          }
        >
          <div className="space-y-5">
            {selected.sourceDocId && (
              <p className="rounded-lg bg-blue-50 p-3 text-xs font-medium text-blue-700">
                Phiếu này được lập từ chứng từ {selected.sourceDocId}.
              </p>
            )}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs text-[#819185]">Ngày phiếu</dt>
                <dd className="font-medium text-[#253d31]">{dateVN(selected.date)}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-[#819185]">Loại phiếu</dt>
                <dd className="font-medium text-[#253d31]">{selected.kind}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-[#819185]">Trạng thái</dt>
                <dd>
                  <Badge tone={selected.status === 'draft' ? 'orange' : 'green'}>
                    {selected.status === 'draft' ? 'Bản nháp' : 'Đã xác nhận'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-[#819185]">Số mặt hàng</dt>
                <dd className="font-semibold text-[#253d31]">{selected.lines.length}</dd>
              </div>
            </dl>

            {selected.status === 'confirmed' && (
              <p className={`rounded-lg px-3 py-2 text-xs ${selected.stockApplied ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                {selected.stockApplied
                  ? 'Phiếu đã ghi nhận cộng/trừ tồn kho khi xác nhận ở v0.5.2.'
                  : 'Phiếu này được xác nhận ở phiên bản cũ, không tự động cộng/trừ tồn kho khi nâng cấp.'}
              </p>
            )}

            {selectedCheck && !selectedCheck.canConfirm && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {selectedCheck.shortages.length > 0
                      ? `Phiếu đang thiếu tồn kho ở ${selectedCheck.shortages.length} mặt hàng.`
                      : 'Phiếu có mặt hàng cần kiểm tra.'}
                  </p>
                  {selectedCheck.shortages.map((shortage) => (
                    <p key={shortage.productId} className="mt-1 text-xs">
                      {productById(shortage.productId)?.name ?? shortage.productId}: cần {number(shortage.requested)},
                      tồn {number(shortage.available)}, thiếu {number(shortage.shortage)}.
                    </p>
                  ))}
                  {selectedCheck.errors.map((error, index) => (
                    <p key={index} className="mt-1 text-xs">{error}</p>
                  ))}
                  <p className="mt-2 text-xs">
                    Bạn vẫn có thể chỉnh sửa phiếu nháp hoặc nhập thêm hàng trước khi xác nhận.
                  </p>
                </div>
              </div>
            )}

            {selectedCheck?.canConfirm && selected.kind === 'Xuất kho' && (
              <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                <CheckCircle2 size={16} className="shrink-0" />
                Tất cả mặt hàng đang đủ tồn kho để xuất. Hệ thống sẽ kiểm tra lại khi xác nhận.
              </div>
            )}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#173c2b]">Chi tiết mặt hàng</h3>
              <div className="overflow-x-auto rounded-xl border border-[#e3ebe5]">
                <table className="data-table min-w-[1080px]">
                  <thead>
                    <tr>
                      <th className="w-12 !px-3">STT</th>
                      <th className="w-28 !px-3">MÃ HÀNG</th>
                      <th className="min-w-[200px] !px-3">TÊN MẶT HÀNG</th>
                      <th className="w-20 !px-3">ĐƠN VỊ</th>
                      <th className="w-28 !px-3 text-right">{selected.kind === 'Nhập kho' ? 'SỐ LƯỢNG NHẬP' : 'SỐ LƯỢNG XUẤT'}</th>
                      <th className="w-28 !px-3 text-right">TỒN HIỆN TẠI</th>
                      {selected.status === 'draft' && (
                        <th className="w-32 !px-3 text-right">TỒN DỰ KIẾN</th>
                      )}
                      <th className="w-32 !px-3">TÌNH TRẠNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPages.items.map((line, rowIndex) => {
                      const index = detailPages.startIndex + rowIndex;
                      const product = productById(line.productId);
                      const available = stockById(line.productId)?.quantity;
                      const isDraft = selected.status === 'draft';
                      const invalid =
                        !product ||
                        available === undefined ||
                        !Number.isFinite(available) ||
                        available < 0 ||
                        !Number.isFinite(line.quantity) ||
                        line.quantity <= 0;
                      const shortage = selectedCheck?.shortages.find(
                        (item) => item.productId === line.productId,
                      );
                      const expected = isDraft && !invalid && available !== undefined
                        ? Math.round(
                            (available + (selected.kind === 'Nhập kho' ? 1 : -1) * line.quantity) * 1_000_000,
                          ) / 1_000_000
                        : null;

                      return (
                        <tr key={`${line.productId}-${index}`} className={shortage ? '!bg-rose-50/70' : undefined}>
                          <td className="!px-3 !py-3">{index + 1}</td>
                          <td className="!px-3 !py-3 text-[#819185]">{line.productId}</td>
                          <td className="!px-3 !py-3 font-medium text-[#253d31]">
                            {product?.name ?? 'Mặt hàng không còn trong danh mục'}
                          </td>
                          <td className="!px-3 !py-3">{product?.unit ?? '—'}</td>
                          <td className="!px-3 !py-3 text-right font-semibold">{number(line.quantity)}</td>
                          <td className="!px-3 !py-3 text-right">{available === undefined ? '—' : number(available)}</td>
                          {isDraft && (
                            <td className={`!px-3 !py-3 text-right font-semibold ${shortage ? '!text-rose-700' : ''}`}>
                              {expected === null ? '—' : number(expected)}
                            </td>
                          )}
                          <td className="!px-3 !py-3">
                            {!isDraft ? (
                              <Badge tone={selected.stockApplied ? 'green' : 'gray'}>
                                {selected.stockApplied ? 'Đã cập nhật' : 'Phiếu cũ'}
                              </Badge>
                            ) : invalid ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                                <AlertTriangle size={14} /> Cần kiểm tra
                              </span>
                            ) : shortage ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                                <AlertTriangle size={14} /> Thiếu {number(shortage.shortage)}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-700">
                                {selected.kind === 'Xuất kho' ? 'Đủ hàng' : 'Hợp lệ'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TableFooter total={detailPages.total} page={detailPages.page} onPageChange={detailPages.setPage} />
              {selected.status === 'confirmed' && (
                <p className="mt-2 text-xs text-[#819185]">
                  Tồn hiện tại là số tồn mới nhất, không phải tồn tại thời điểm xác nhận phiếu.
                  Phiếu đã xác nhận không được đánh giá thiếu hàng lần nữa.
                </p>
              )}
            </section>

            <div className="rounded-lg bg-[#f7f9f8] p-3">
              <p className="mb-1 text-xs text-[#819185]">Diễn giải</p>
              <p className="whitespace-pre-wrap break-words text-sm text-[#253d31]">
                {selected.note || '—'}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {editing?.status === 'draft' && (
        <StockMovementForm
          key={editing.id}
          kind={editing.kind}
          movement={editing}
          onClose={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      )}

      {deleting?.status === 'draft' && (
        <Modal
          title={`Xóa phiếu ${deleting.id}?`}
          subtitle="Hành động này không thể hoàn tác trong bản demo."
          onClose={() => setDeletingId(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeletingId(null)}>Hủy</Button>
              <Button variant="destructive" onClick={() => { deleteStockMovement(deleting.id); setDeletingId(null); }}>
                <Trash2 size={15} /> Xóa phiếu nháp
              </Button>
            </>
          }
        >
          <p className="text-sm">Bạn có chắc muốn xóa phiếu <strong>{deleting.id}</strong> và tất cả dòng mặt hàng trong phiếu?</p>
        </Modal>
      )}

      {confirming?.status === 'draft' && confirmationCheck && (
        <Modal
          wide
          title={`Xác nhận phiếu ${confirming.id}?`}
          subtitle="Sau xác nhận, phiếu sẽ khóa sửa/xóa và tồn kho được cập nhật ngay."
          onClose={() => setConfirmingId(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmingId(null)}>Hủy</Button>
              <Button disabled={!confirmationCheck.canConfirm || linkedCheck?.ok === false} onClick={confirm}>
                <CheckCircle2 size={15} /> Xác nhận và cập nhật kho
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-[#304a3b]">
              {confirming.kind === 'Nhập kho'
                ? 'Xác nhận sẽ cộng từng mặt hàng vào số tồn hiện tại.'
                : 'Xác nhận sẽ trừ từng mặt hàng khỏi số tồn hiện tại. Tất cả mặt hàng phải đủ tồn; nếu một mặt hàng thiếu, không trừ bất kỳ mặt hàng nào.'}
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#e3ebe5]">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>MẶT HÀNG</th>
                    <th>ĐƠN VỊ</th>
                    <th className="text-right">TỒN HIỆN TẠI</th>
                    <th className="text-right">{confirming.kind === 'Nhập kho' ? 'NHẬP' : 'XUẤT'}</th>
                    <th className="text-right">DỰ KIẾN SAU XÁC NHẬN</th>
                    <th>TÌNH TRẠNG</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmationPages.items.map((line) => {
                    const product = productById(line.productId);
                    const available = stockById(line.productId)?.quantity;
                    const shortage = confirmationCheck.shortages.find((item) => item.productId === line.productId);
                    const expected = available === undefined ? null
                      : Math.round((available + (confirming.kind === 'Nhập kho' ? 1 : -1) * line.quantity) * 1_000_000) / 1_000_000;
                    return (
                      <tr key={line.productId} className={shortage ? '!bg-rose-50' : undefined}>
                        <td className="max-w-[250px] whitespace-normal font-medium">{product?.name ?? line.productId}</td>
                        <td>{product?.unit ?? '—'}</td>
                        <td className="text-right">{available === undefined ? '—' : number(available)}</td>
                        <td className="text-right font-semibold">{number(line.quantity)}</td>
                        <td className={`text-right font-semibold ${shortage ? '!text-rose-700' : ''}`}>
                          {expected === null ? '—' : number(expected)}
                        </td>
                        <td>
                          {shortage ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                              <AlertTriangle size={14} /> Thiếu {number(shortage.shortage)}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-700">{available === undefined ? 'Chưa có tồn' : 'Hợp lệ'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TableFooter total={confirmationPages.total} page={confirmationPages.page} onPageChange={confirmationPages.setPage} />
            {linkedCheck?.ok === false && (
              <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">{linkedCheck.message}</p>
            )}
            {!confirmationCheck.canConfirm && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <AlertTriangle size={18} className="shrink-0" />
                <div>
                  <strong>Chưa thể xác nhận phiếu.</strong>
                  {confirmationCheck.errors.map((error, index) => (
                    <p key={index} className="mt-1 text-xs">{error}</p>
                  ))}
                  {confirmationCheck.shortages.map((shortage) => (
                    <p key={shortage.productId} className="mt-1 text-xs">
                      {productById(shortage.productId)?.name ?? shortage.productId}: cần {number(shortage.requested)},
                      hiện có {number(shortage.available)}, thiếu {number(shortage.shortage)}.
                    </p>
                  ))}
                  <p className="mt-2 text-xs">Có thể đóng hộp thoại để sửa phiếu nháp hoặc nhập thêm hàng.</p>
                </div>
              </div>
            )}
            {confirmError && <p role="alert" className="text-xs font-medium text-rose-700">{confirmError}</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
