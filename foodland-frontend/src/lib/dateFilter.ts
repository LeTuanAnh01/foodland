/** Lọc theo ngày nghiệp vụ dạng YYYY-MM-DD, không dùng timezone của Date.parse. */
export type DateFilterMode = 'all' | 'day' | 'range' | 'week' | 'month' | 'year';

export type DateFilterValue = {
  mode: DateFilterMode;
  day: string;
  from: string;
  to: string;
  week: string;
  month: string;
  year: string;
};

export const EMPTY_DATE_FILTER: DateFilterValue = {
  mode: 'all', day: '', from: '', to: '', week: '', month: '', year: '',
};

export function localDateValue(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Tuần ISO: bắt đầu thứ Hai, có thể nằm khác năm dương lịch. */
export function isoWeekStart(week: string): string | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return null;
  const year = Number(match[1]);
  const number = Number(match[2]);
  if (number < 1 || number > 53) return null;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const weekday = (jan4.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(year, 0, 4 - weekday + (number - 1) * 7));
  // Một số năm ISO không có tuần 53.
  if (isoWeekFromDate(monday.toISOString().slice(0, 10)) !== week) return null;
  return monday.toISOString().slice(0, 10);
}

export function isoWeekFromDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return '';
  const weekday = (parsed.getUTCDay() + 6) % 7;
  parsed.setUTCDate(parsed.getUTCDate() + 3 - weekday); // thứ Năm quyết định năm ISO
  const isoYear = parsed.getUTCFullYear();
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Weekday = (jan4.getUTCDay() + 6) % 7;
  const weekOneThursday = new Date(Date.UTC(isoYear, 0, 4 - jan4Weekday + 3));
  const weekNumber = 1 + Math.round((parsed.getTime() - weekOneThursday.getTime()) / 604800000);
  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
}

export function matchesDateFilter(date: string, filter: DateFilterValue): boolean {
  const value = date.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return filter.mode === 'all';
  switch (filter.mode) {
    case 'day': return !filter.day || value === filter.day;
    case 'range': return (!filter.from || value >= filter.from) && (!filter.to || value <= filter.to)
      && (!filter.from || !filter.to || filter.from <= filter.to);
    case 'week': return !filter.week || isoWeekFromDate(value) === filter.week;
    case 'month': return !filter.month || value.startsWith(`${filter.month}-`);
    case 'year': return !filter.year || value.startsWith(`${filter.year}-`);
    default: return true;
  }
}
