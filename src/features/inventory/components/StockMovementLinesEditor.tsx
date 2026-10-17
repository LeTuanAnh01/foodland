import { TableFooter, usePagination } from '@/components/shared';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product, Stock, StockMovementKind, StockMovementLine } from '@/data/types';

interface Props {
  products: Product[];
  stocks: Stock[];
  kind: StockMovementKind;
  lines: StockMovementLine[];
  onChange: (lines: StockMovementLine[]) => void;
}

const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 6 });

export function StockMovementLinesEditor({ products, stocks, kind, lines, onChange }: Props) {
  const isIssue = kind === 'Xuất kho';
  const pagination = usePagination(lines, [], { followAppend: true });

  function updateLine(index: number, patch: Partial<StockMovementLine>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    onChange([...lines, { productId: '', quantity: 1 }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, i) => i !== index));
  }

  const shortages = isIssue
    ? lines.filter((line) => {
        const stock = stocks.find((item) => item.productId === line.productId);
        return stock && Number.isFinite(line.quantity) && line.quantity > stock.quantity;
      })
    : [];

  return (
    <div className="min-w-0 space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#173c2b]">Danh sách mặt hàng</h3>
          <p className="mt-1 text-xs text-[#84948a]">
            {isIssue
              ? 'Tồn kho được đối chiếu ngay khi bạn nhập số lượng xuất.'
              : 'Tồn sau nhập là số dự kiến; chỉ cập nhật khi xác nhận phiếu.'}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus size={16} /> Thêm dòng
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e3ebe5]">
        <table className="data-table min-w-[1050px]">
          <thead>
            <tr>
              <th className="w-12 !px-3">STT</th>
              <th className="min-w-[220px] !px-3">MẶT HÀNG</th>
              <th className="w-24 !px-3">MÃ HÀNG</th>
              <th className="w-20 !px-3">ĐƠN VỊ</th>
              <th className="w-28 !px-3 text-right">TỒN HIỆN TẠI</th>
              <th className="w-32 !px-3 text-right">{isIssue ? 'SỐ LƯỢNG XUẤT' : 'SỐ LƯỢNG NHẬP'}</th>
              <th className="w-28 !px-3 text-right">TỒN DỰ KIẾN</th>
              {isIssue && <th className="w-28 !px-3">TÌNH TRẠNG</th>}
              <th className="w-14 !px-3 text-center">XÓA</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((line, rowIndex) => {
              const index = pagination.startIndex + rowIndex;
              const product = products.find((item) => item.id === line.productId);
              const stock = stocks.find((item) => item.productId === line.productId);
              const available = stock?.quantity;
              const validQuantity = Number.isFinite(line.quantity) && line.quantity > 0;
              const shortage = isIssue && available !== undefined && validQuantity && line.quantity > available;
              const remainder = available !== undefined && validQuantity
                ? Math.round((available + (isIssue ? -1 : 1) * line.quantity) * 1_000_000) / 1_000_000
                : null;

              return (
                <tr key={index} className={shortage ? '!bg-rose-50/70' : undefined}>
                  <td className="!px-3 !py-2.5 text-[#809389]">{index + 1}</td>
                  <td className="!px-3 !py-2.5">
                    <select
                      aria-label={`Mặt hàng dòng ${index + 1}`}
                      className="field-select"
                      required
                      value={line.productId}
                      onChange={(event) => updateLine(index, { productId: event.target.value })}
                    >
                      <option value="">Chọn mặt hàng...</option>
                      {products.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={lines.some(
                            (other, otherIndex) => otherIndex !== index && other.productId === item.id,
                          )}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="!px-3 !py-2.5 text-[#809389]">{product?.id ?? '—'}</td>
                  <td className="!px-3 !py-2.5">{product?.unit ?? '—'}</td>
                  <td className="!px-3 !py-2.5 text-right font-medium">
                    {available !== undefined ? number(available) : '—'}
                  </td>
                  <td className="!px-3 !py-2.5">
                    <Input
                      aria-label={`Số lượng dòng ${index + 1}`}
                      type="number"
                      min="0.000001"
                      step="any"
                      required
                      value={line.quantity}
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                      className="w-28 text-right"
                    />
                  </td>
                  <td className={`!px-3 !py-2.5 text-right font-semibold ${shortage ? '!text-rose-700' : ''}`}>
                    {remainder === null ? '—' : number(remainder)}
                  </td>
                  {isIssue && (
                    <td className="!px-3 !py-2.5">
                      {!line.productId ? (
                        <span className="text-xs text-slate-400">Chọn hàng</span>
                      ) : available === undefined ? (
                        <span className="text-xs font-medium text-rose-700">Không có tồn</span>
                      ) : !validQuantity ? (
                        <span className="text-xs text-amber-700">Kiểm tra SL</span>
                      ) : shortage ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                          <AlertTriangle size={13} /> Thiếu {number(line.quantity - available)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700">Đủ hàng</span>
                      )}
                    </td>
                  )}
                  <td className="!px-3 !py-2.5 text-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      title="Xóa dòng"
                      aria-label={`Xóa mặt hàng dòng ${index + 1}`}
                      disabled={lines.length === 1}
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage} />

      {shortages.length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            <strong>{shortages.length} mặt hàng đang thiếu tồn kho.</strong> Bạn vẫn có thể lưu bản nháp,
            nhưng không thể xác nhận phiếu cho đến khi đủ hàng hoặc giảm số lượng xuất.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#809389]">
        <span>{lines.length} dòng mặt hàng</span>
        <span>Mỗi mã hàng chỉ có một dòng; không cộng tổng số lượng khác đơn vị.</span>
      </div>
    </div>
  );
}
