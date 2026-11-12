import { CalendarDays, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  EMPTY_DATE_FILTER,
  isoWeekFromDate,
  localDateValue,
} from '@/lib/dateFilter';
import type { DateFilterMode, DateFilterValue } from '@/lib/dateFilter';

type Props = {
  value: DateFilterValue;
  onChange: (next: DateFilterValue) => void;
  /** Ngày mới nhất trong danh sách, dùng để chọn tuần/tháng/năm mặc định. */
  latestDate?: string;
  label?: string;
};

const controlClass =
  'h-9 min-w-0 rounded-lg border border-[#dce7df] bg-white px-3 text-xs text-[#32483a] outline-none focus:border-emerald-500';

const modes: Array<{ value: DateFilterMode; label: string }> = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'day', label: 'Theo ngày' },
  { value: 'range', label: 'Khoảng ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year', label: 'Theo năm' },
];

export function DateFilter({ value, onChange, latestDate, label = 'Ngày chứng từ' }: Props) {
  const update = (patch: Partial<DateFilterValue>) => onChange({ ...value, ...patch });
  const referenceDate = latestDate && /^\d{4}-\d{2}-\d{2}$/.test(latestDate)
    ? latestDate : localDateValue();

  function setMode(mode: DateFilterMode) {
    onChange({
      ...EMPTY_DATE_FILTER,
      mode,
      day: mode === 'day' ? referenceDate : '',
      week: mode === 'week' ? isoWeekFromDate(referenceDate) : '',
      month: mode === 'month' ? referenceDate.slice(0, 7) : '',
      year: mode === 'year' ? referenceDate.slice(0, 4) : '',
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {label}</span>
        <select className={controlClass} value={value.mode}
          onChange={(event) => setMode(event.target.value as DateFilterMode)}>
          {modes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
        </select>
      </label>

      {value.mode === 'day' && (
        <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
          Chọn ngày
          <input aria-label="Chọn ngày" className={controlClass} type="date" value={value.day}
            onChange={(event) => update({ day: event.target.value })} />
        </label>
      )}
      {value.mode === 'range' && (
        <>
          <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
            Từ ngày
            <input aria-label="Từ ngày" className={controlClass} type="date" value={value.from}
              max={value.to || undefined} onChange={(event) => update({ from: event.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
            Đến ngày
            <input aria-label="Đến ngày" className={controlClass} type="date" value={value.to}
              min={value.from || undefined} onChange={(event) => update({ to: event.target.value })} />
          </label>
          <span className="pb-2 text-[11px] text-slate-400">Có thể chỉ chọn một đầu mốc</span>
        </>
      )}
      {value.mode === 'week' && (
        <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
          Chọn tuần (Thứ Hai – Chủ nhật)
          <input aria-label="Chọn tuần" className={controlClass} type="week" value={value.week}
            onChange={(event) => update({ week: event.target.value })} />
        </label>
      )}
      {value.mode === 'month' && (
        <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
          Chọn tháng
          <input aria-label="Chọn tháng" className={controlClass} type="month" value={value.month}
            onChange={(event) => update({ month: event.target.value })} />
        </label>
      )}
      {value.mode === 'year' && (
        <label className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600">
          Chọn năm
          <input aria-label="Chọn năm" className={`${controlClass} w-28`} type="number" min="2000" max="2100"
            step="1" value={value.year} onChange={(event) => update({ year: event.target.value })} />
        </label>
      )}
      {value.mode !== 'all' && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...EMPTY_DATE_FILTER })}>
          <RotateCcw size={14} /> Xóa lọc ngày
        </Button>
      )}
    </div>
  );
}
