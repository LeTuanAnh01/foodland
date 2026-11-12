import * as React from 'react';
import {
  BarChart3, BookOpenCheck, CalendarRange, ChevronRight, Database, Download,
  FileSpreadsheet, FilterX, Info, Search, Sparkles,
} from 'lucide-react';
import { DateFilter, EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useFoodland } from '@/data/store';
import { EMPTY_DATE_FILTER } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { compact, dateVN, downloadCsv, money } from '@/lib/utils';
import { reportCatalog, reportGroups } from '../center/catalog';
import type { ReportColumn, ReportGroup } from '../center/catalog';
import { buildReport, filterReportRows, reportPeriodLabel } from '../center/reportData';
import type { ReportCell } from '../center/reportData';
import { exportReportXlsx } from '../center/excelExport';

function displayValue(value: ReportCell | undefined, column: ReportColumn) {
  if (value === null || value === undefined || value === '') return '—';
  if (column.type === 'money' && typeof value === 'number') return money(value);
  if (column.type === 'number' && typeof value === 'number') return compact(value);
  if (column.type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return dateVN(value);
  return String(value);
}

export function ReportsPage() {
  const { db } = useFoodland();
  const [group, setGroup] = React.useState<ReportGroup | 'all'>('all');
  const [catalogSearch, setCatalogSearch] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState<'all' | 'data' | 'layout'>('all');
  const [selectedId, setSelectedId] = React.useState('sell-summary');
  const [query, setQuery] = React.useState('');
  const [period, setPeriod] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState('');
  const viewerRef = React.useRef<HTMLDivElement>(null);

  const catalog = React.useMemo(() => reportCatalog.filter((report) => (
    (group === 'all' || report.group === group) &&
    (kindFilter === 'all' || report.mode === kindFilter) &&
    `${report.title} ${report.description}`.toLocaleLowerCase('vi').includes(catalogSearch.trim().toLocaleLowerCase('vi'))
  )), [group, kindFilter, catalogSearch]);

  const report = React.useMemo(() => buildReport(db, selectedId, period), [db, selectedId, period]);
  const filtered = React.useMemo(() => filterReportRows(report.rows, query), [report.rows, query]);
  const pages = usePagination(filtered, [selectedId, period, query]);
  const monetaryColumn = report.definition.columns.find((col) => col.key === 'amount' && col.type === 'money');
  const totalMoney = monetaryColumn
    ? filtered.reduce((sum, row) => sum + (typeof row.amount === 'number' ? row.amount : 0), 0)
    : null;

  function selectReport(id: string) {
    setSelectedId(id);
    setQuery('');
    setPeriod({ ...EMPTY_DATE_FILTER });
    setExportError('');
    // Wait for the selected section to render before scrolling.
    requestAnimationFrame(() => viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function exportExcel() {
    if (exporting) return;
    setExportError('');
    setExporting(true);
    try {
      // Export ALL rows that pass filters, not only the currently visible page.
      await exportReportXlsx(report, filtered, period, query);
    } catch (error) {
      console.error('Foodland export Excel error', error);
      setExportError('Không xuất được Excel. Hãy kiểm tra kết nối/tải lại trang hoặc thử lại.');
    } finally {
      setExporting(false);
    }
  }

  function exportCsv() {
    downloadCsv(`foodland-${report.definition.id}.csv`, report.definition.columns.map((c) => c.label),
      filtered.map((row) => report.definition.columns.map((c) => {
        const value = row[c.key];
        return typeof value === 'number' ? value : String(value ?? '');
      })));
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-2xl border border-[#dbe9e0] bg-gradient-to-r from-[#f0faf4] via-white to-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-[#0d8459]"><Sparkles size={14} /> REPORT CENTER · v0.9</span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#18392b]">Thư viện báo cáo Foodland</h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-[#718477]">Lựa chọn mẫu báo cáo, lọc dữ liệu, xem trước và xuất Excel có định dạng để gửi duyệt. Các mẫu chưa chốt công thức được tách riêng.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#e2ece5] bg-white px-4 py-3 text-[#0f6e50]">
            <FileSpreadsheet size={24} />
            <div><strong className="block text-xl">{reportCatalog.length}</strong><span className="text-[11px]">mẫu báo cáo</span></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d6e9db] bg-white px-3 py-1.5 text-[#197050]"><Database size={13} /> {reportCatalog.filter((r) => r.mode === 'data').length} mẫu từ dữ liệu demo</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#efdcb6] bg-[#fff9ed] px-3 py-1.5 text-[#91651d]"><BookOpenCheck size={13} /> {reportCatalog.filter((r) => r.mode === 'layout').length} mẫu chờ chốt nghiệp vụ</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e1e9e2] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eef2ee] p-4">
          {reportGroups.map((item) => (
            <button type="button" key={item.id} onClick={() => setGroup(item.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${group === item.id ? 'border-[#0b8f62] bg-[#eaf7f0] text-[#087e55]' : 'border-[#e8eeea] bg-white text-[#65766b] hover:bg-[#f5f9f6]'}`}>
              {item.label}
              <span className="ml-1 text-[10px] opacity-60">{item.id === 'all' ? reportCatalog.length : reportCatalog.filter((r) => r.group === item.id).length}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 border-b border-[#eef2ee] px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-[#8fa299]" />
            <input aria-label="Tìm mẫu báo cáo" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Tìm mẫu theo tên hoặc nội dung..."
              className="h-9 w-full rounded-lg border border-[#dce7df] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#0f9867]" />
          </div>
          <select aria-label="Loại mẫu" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
            className="h-9 rounded-lg border border-[#dce7df] bg-white px-3 text-xs text-[#425849]">
            <option value="all">Tất cả mẫu</option>
            <option value="data">Có dữ liệu demo</option>
            <option value="layout">Chờ chốt nghiệp vụ</option>
          </select>
          {(group !== 'all' || kindFilter !== 'all' || catalogSearch) &&
            <Button variant="ghost" size="sm" onClick={() => { setGroup('all'); setKindFilter('all'); setCatalogSearch(''); }}><FilterX size={14} /> Xóa lọc</Button>}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {catalog.map((item) => (
            <button type="button" key={item.id} onClick={() => selectReport(item.id)}
              className={`flex min-h-[134px] flex-col items-start rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#78c9a3] hover:shadow-sm ${selectedId === item.id ? 'border-[#0c9a64] bg-[#f1faf4]' : 'border-[#e6ede7] bg-white'}`}>
              <div className="flex w-full items-start justify-between gap-2">
                <span className={`flex size-9 items-center justify-center rounded-lg ${item.mode === 'layout' ? 'bg-amber-50 text-amber-700' : 'bg-[#e7f5eb] text-[#0d875c]'}`}><FileSpreadsheet size={18} /></span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.mode === 'layout' ? 'bg-amber-50 text-amber-800' : 'bg-[#ebf7f0] text-[#167c53]'}`}>
                  {item.mode === 'layout' ? 'Mẫu chờ duyệt' : 'Dữ liệu demo'}
                </span>
              </div>
              <strong className="mt-3 text-[13px] text-[#213b2c]">{item.title}</strong>
              <span className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#829188]">{item.description}</span>
              <span className="mt-auto flex items-center gap-1 pt-2 text-[11px] font-semibold text-[#0c885c]">Xem báo cáo <ChevronRight size={13} /></span>
            </button>
          ))}
        </div>
        {catalog.length === 0 && <div className="px-5 pb-6"><EmptyState text="Không tìm thấy mẫu báo cáo phù hợp." /></div>}
      </section>

      <section ref={viewerRef} className="scroll-mt-6 overflow-hidden rounded-xl border border-[#dfe9e1] bg-white shadow-[0_4px_20px_#16392108]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf1ed] px-5 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <BarChart3 size={17} className="text-[#16895d]" />
              <strong className="text-base text-[#1e3b2b]">{report.definition.title}</strong>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${report.definition.mode === 'layout' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{report.definition.mode === 'layout' ? 'MẪU THAM KHẢO' : 'DỮ LIỆU DEMO'}</span>
            </div>
            <p className="mt-2 text-xs text-[#77887c]">{report.definition.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.definition.mode === 'data' && <Button variant="outline" size="sm" onClick={exportCsv}><Download size={15} /> CSV</Button>}
            <Button size="sm" disabled={exporting} onClick={() => void exportExcel()}><FileSpreadsheet size={15} /> {exporting ? 'Đang tạo Excel...' : 'Xuất Excel (.xlsx)'}</Button>
          </div>
        </div>
        <div className="space-y-3 p-5 pb-4">
          {report.definition.timeframe === 'transaction' ? <DateFilter value={period} onChange={setPeriod} label="Thời gian báo cáo" /> :
            <div className="flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-xs leading-5 text-sky-800"><CalendarRange size={16} className="shrink-0" /> Báo cáo hiện trạng: dùng số liệu mới nhất. Không áp dụng bộ lọc ngày vì chưa lưu tồn kho lịch sử.</div>}
          {report.definition.mode === 'data' &&
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-2.5 text-[#8da095]" />
              <input aria-label="Tìm trong báo cáo" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm trong nội dung báo cáo..."
                className="h-9 w-full rounded-lg border border-[#dce7df] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#11895f]" />
            </div>}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e6efe8] bg-[#f5faf7] px-4 py-3 text-xs">
            <div className="flex flex-wrap gap-4">
              <span><span className="text-[#819286]">Kỳ: </span><strong>{reportPeriodLabel(period, report.definition.timeframe)}</strong></span>
              <span><span className="text-[#819286]">Số dòng: </span><strong>{report.definition.mode === 'layout' ? 'Chưa có dữ liệu' : filtered.length}</strong></span>
              {totalMoney !== null && <span><span className="text-[#819286]">Tổng giá trị: </span><strong className="text-[#0c8659]">{money(totalMoney)}</strong></span>}
            </div>
            <span className="text-[11px] text-[#789082]">10 dòng mỗi trang · Xuất đủ dữ liệu sau lọc</span>
          </div>
          <div className={`flex items-start gap-2 rounded-lg p-3 text-[11px] leading-5 ${report.definition.mode === 'layout' ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-600'}`}>
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>{report.note}</span>
          </div>
          {exportError && <p role="alert" className="text-xs font-semibold text-red-600">{exportError}</p>}
        </div>
        <TableScroll>
          <table className="data-table">
            <thead><tr>{report.definition.columns.map((col) => <th key={col.key} className={col.type === 'money' || col.type === 'number' ? 'text-right' : ''}>{col.label.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {report.definition.mode === 'layout'
                ? <tr><td colSpan={report.definition.columns.length} className="py-10 text-center text-xs text-amber-700">Chưa có số liệu hoặc công thức được kế toán xác nhận. Có thể xuất mẫu Excel trống để duyệt cột và bố cục.</td></tr>
                : pages.items.map((row, index) => <tr key={`${selectedId}-${pages.page}-${index}`}>{report.definition.columns.map((col) => <td key={col.key} className={col.type === 'number' || col.type === 'money' ? 'text-right tabular-nums' : ''}>{displayValue(row[col.key], col)}</td>)}</tr>)}
            </tbody>
          </table>
        </TableScroll>
        {report.definition.mode === 'data' && (
          filtered.length > 0
            ? <TableFooter total={pages.total} page={pages.page} onPageChange={pages.setPage} />
            : <div className="p-4"><EmptyState text="Chưa có dữ liệu cho mẫu báo cáo và bộ lọc này." /></div>
        )}
      </section>
      <p className="flex items-start gap-2 text-[11px] leading-5 text-[#899a8d]"><Info size={14} className="mt-0.5 shrink-0" /> Foodland đang lưu demo theo từng trình duyệt (LocalStorage). File Excel chỉ là báo cáo mẫu để góp ý, không thay thế chứng từ, sổ sách kế toán và hóa đơn chính thức.</p>
    </div>
  );
}
