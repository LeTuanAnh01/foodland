import type { ReportResult, ReportRow } from './reportData';
import { reportPeriodLabel } from './reportData';
import type { DateFilterValue } from '@/lib/dateFilter';

const GREEN = 'FF116B50';
const DARK = 'FF123C2C';
const MUTED = 'FF5F7168';
const PALE = 'FFEAF5EF';
const LINE = 'FFDAE7DE';
const WHITE = 'FFFFFFFF';
const DATE_FMT = 'dd/mm/yyyy';
const MONEY_FMT = '#,##0;[Red](#,##0);–';
const QTY_FMT = '#,##0.##;[Red](#,##0.##);–';
const pad = (value: number) => String(value).padStart(2, '0');
const exportStamp = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

function safeName(value: string) { return value.replace(/[^a-zA-Z0-9_-]/g, '_'); }

/** Files are generated in the browser; reports stay independent of API/storage. */
export async function exportReportXlsx(
  report: ReportResult,
  visibleRows: ReportRow[],
  period: DateFilterValue,
  keyword: string,
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs/dist/exceljs.min.js');
  const book = new ExcelJS.Workbook();
  book.creator = 'Foodland Demo';
  book.subject = `Mẫu báo cáo ${report.definition.title}`;
  book.created = new Date();
  const sheet = book.addWorksheet('Báo cáo', {
    views: [{ state: 'frozen', ySplit: 9 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    properties: { defaultRowHeight: 22 },
  });
  const columns = report.definition.columns;
  const count = columns.length;
  sheet.columns = columns.map((col) => ({ width: col.width ?? (col.type === 'money' ? 22 : col.type === 'date' ? 16 : col.type === 'number' ? 15 : 23) }));
  const merged = (row: number, value: string) => {
    sheet.mergeCells(row, 1, row, count);
    sheet.getCell(row, 1).value = value;
    return sheet.getCell(row, 1);
  };

  sheet.getRow(1).height = 29;
  let cell = merged(1, 'FOODLAND  |  BÁO CÁO QUẢN TRỊ NỘI BỘ');
  cell.font = { name: 'Aptos Display', size: 13, bold: true, color: { argb: WHITE } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } };
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(2).height = 42;
  cell = merged(2, report.definition.title.toLocaleUpperCase('vi'));
  cell.font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: GREEN } };
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(3).height = 24;
  cell = merged(3, `Kỳ báo cáo: ${reportPeriodLabel(period, report.definition.timeframe)}    •    Lập lúc: ${exportStamp(new Date())}`);
  cell.font = { name: 'Aptos', size: 11, color: { argb: MUTED } };
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(4).height = 24;
  cell = merged(4, `Phạm vi: ${keyword.trim() ? `Lọc từ khóa “${keyword.trim()}”` : 'Tất cả bản ghi phù hợp'}    •    Tổng số dòng: ${visibleRows.length}`);
  cell.font = { name: 'Aptos', size: 10, color: { argb: MUTED } };
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(5).height = 12;
  sheet.getRow(6).height = 25;
  cell = merged(6, report.definition.mode === 'layout'
    ? 'MẪU CHỜ DUYỆT – KHÔNG CÓ SỐ LIỆU KẾ TOÁN, CHƯA CÓ CÔNG THỨC ĐƯỢC XÁC NHẬN'
    : 'BÁO CÁO TỪ DỮ LIỆU DEMO – CHƯA PHẢI BÁO CÁO KẾ TOÁN CHÍNH THỨC');
  cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: report.definition.mode === 'layout' ? 'FF92400E' : GREEN } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: report.definition.mode === 'layout' ? 'FFFFF2D8' : PALE } };
  cell.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(7).height = 33;
  cell = merged(7, report.note);
  cell.font = { name: 'Aptos', size: 10, italic: true, color: { argb: MUTED } };
  cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };

  const headerRow = sheet.getRow(9);
  headerRow.height = 36;
  columns.forEach((col, index) => {
    const header = headerRow.getCell(index + 1);
    header.value = col.label;
    header.font = { name: 'Aptos', size: 10, bold: true, color: { argb: WHITE } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } };
    header.alignment = { vertical: 'middle', wrapText: true, horizontal: col.type === 'money' || col.type === 'number' ? 'right' : 'left' };
    header.border = { bottom: { style: 'medium', color: { argb: DARK } } };
  });

  const dataRows = report.definition.mode === 'layout' ? [{}, {}, {}, {}, {}] : visibleRows;
  if (dataRows.length === 0) {
    const empty = merged(10, 'Không có dữ liệu phù hợp với bộ lọc.');
    empty.font = { name: 'Aptos', size: 11, italic: true, color: { argb: MUTED } };
    sheet.getRow(10).height = 29;
  } else {
    dataRows.forEach((record, rowIndex) => {
      const row = sheet.getRow(10 + rowIndex);
      row.height = 25;
      columns.forEach((col, index) => {
        const c = row.getCell(index + 1);
        const v = record[col.key];
        c.value = v === null || v === undefined ? null : col.type === 'date' && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
          ? new Date(`${v}T12:00:00`) : v;
        if (col.type === 'money') c.numFmt = MONEY_FMT;
        if (col.type === 'number') c.numFmt = QTY_FMT;
        if (col.type === 'date') c.numFmt = DATE_FMT;
        c.font = { name: 'Aptos', size: 10, color: { argb: 'FF24392E' } };
        c.alignment = { vertical: 'middle', horizontal: col.type === 'number' || col.type === 'money' ? 'right' : 'left' };
        c.border = { bottom: { style: 'hair', color: { argb: LINE } } };
        if (rowIndex % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5FAF7' } };
        if (typeof v === 'string' && /(Thiếu|Hết hàng|Dưới ngưỡng)/i.test(v)) {
          c.font = { name: 'Aptos', size: 10, color: { argb: 'FFB54708' }, bold: true };
        }
      });
    });
  }

  const dataEnd = 9 + Math.max(1, dataRows.length);
  if (report.definition.mode === 'data' && visibleRows.length > 0) {
    sheet.autoFilter = { from: { row: 9, column: 1 }, to: { row: dataEnd, column: count } };
    const amountIndex = columns.findIndex((col) => col.key === 'amount' && col.type === 'money');
    if (amountIndex >= 0) {
      const totalRow = sheet.getRow(dataEnd + 1);
      totalRow.height = 31;
      for (let col = 1; col <= count; col++) {
        const c = totalRow.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALE } };
        c.font = { name: 'Aptos', size: 11, bold: true, color: { argb: DARK } };
        c.border = { top: { style: 'medium', color: { argb: GREEN } } };
      }
      totalRow.getCell(1).value = 'TỔNG CỘNG';
      const total = totalRow.getCell(amountIndex + 1);
      const letter = sheet.getColumn(amountIndex + 1).letter;
      total.value = { formula: `SUM(${letter}10:${letter}${dataEnd})` };
      total.numFmt = MONEY_FMT;
    }
  }

  const foot = dataEnd + (columns.some((c) => c.key === 'amount') && visibleRows.length > 0 && report.definition.mode === 'data' ? 3 : 2);
  sheet.getRow(foot).height = 25;
  const footNote = merged(foot, 'Lưu ý: Bản xuất từ Foodland Demo. Cần đối chiếu và duyệt biểu mẫu trước khi sử dụng chính thức.');
  footNote.font = { name: 'Aptos', size: 10, color: { argb: MUTED }, italic: true };
  sheet.getRow(foot + 2).height = 25;
  if (count >= 4) {
    sheet.mergeCells(foot + 2, 1, foot + 2, Math.floor(count / 2));
    sheet.mergeCells(foot + 2, Math.floor(count / 2) + 1, foot + 2, count);
    const author = sheet.getCell(foot + 2, 1);
    author.value = 'NGƯỜI LẬP BIỂU';
    author.font = { bold: true, name: 'Aptos', size: 10, color: { argb: DARK } };
    author.alignment = { horizontal: 'center' };
    const approver = sheet.getCell(foot + 2, Math.floor(count / 2) + 1);
    approver.value = 'NGƯỜI KIỂM TRA / PHÊ DUYỆT';
    approver.font = { bold: true, name: 'Aptos', size: 10, color: { argb: DARK } };
    approver.alignment = { horizontal: 'center' };
  }
  sheet.pageSetup.printArea = `A1:${sheet.getColumn(count).letter}${foot + 5}`;
  sheet.pageSetup.printTitlesRow = '1:9';
  sheet.headerFooter.oddFooter = '&LFoodland Demo · Mẫu tham khảo &RTrang &P / &N';

  const buffer = await book.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `Foodland_${safeName(report.definition.id)}_${exportStamp(new Date()).slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
