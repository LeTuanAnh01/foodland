import type { DB, DocKind, StockMovementV2 } from '../../../data/types';
import type { DateFilterValue } from '../../../lib/dateFilter';
import { matchesDateFilter } from '../../../lib/dateFilter';
import { documentAmount } from '../utils/reportMetrics';
import { getDocumentAttention } from '../../documents/utils/documentAttention';
import { getDocumentProgress } from '../../documents/utils/documentProgress';
import { reportCatalog } from './catalog';
import type { ReportDefinition } from './catalog';

export type ReportCell = string | number | null;
export type ReportRow = Record<string, ReportCell>;
export type ReportResult = { definition: ReportDefinition; rows: ReportRow[]; note: string };

function groupTotals<T>(items: T[], keyFn: (entry: T) => string, valueFn: (entry: T) => number) {
  const totals = new Map<string, { count: number; value: number }>();
  for (const entry of items) {
    const key = keyFn(entry);
    const current = totals.get(key) ?? { count: 0, value: 0 };
    current.count += 1;
    current.value += valueFn(entry);
    totals.set(key, current);
  }
  return totals;
}

/** One data source for on-screen preview and XLSX export; no made-up financial numbers. */
export function buildReport(db: DB, id: string, period: DateFilterValue): ReportResult {
  const definition = reportCatalog.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown report: ${id}`);
  if (definition.mode === 'layout') return { definition, rows: [], note: definition.note ?? '' };

  const partnerName = (code: string) => db.partners.find((item) => item.id === code)?.name ?? code;
  const productName = (code: string) => db.products.find((item) => item.id === code)?.name ?? code;
  const productUnit = (code: string) => db.products.find((item) => item.id === code)?.unit ?? '';
  const confirmed = db.docs.filter((d) => d.status === 'Đã xác nhận' && matchesDateFilter(d.date, period));
  const kindDocs = (kind: DocKind) => confirmed.filter((d) => d.kind === kind);
  const documents = db.docs.filter((d) => matchesDateFilter(d.date, period));
  const invoiceRows = db.invoices.filter((i) => matchesDateFilter(i.date, period));
  const movements = db.stockMovements.filter((m) => matchesDateFilter(m.date, period));
  const confirmedMovements = movements.filter((m) => m.status === 'confirmed');
  const stocks = db.stocks.map((s) => {
    const product = db.products.find((p) => p.id === s.productId);
    return {
      code: s.productId, product: product?.name ?? s.productId, unit: product?.unit ?? '',
      location: s.location, stock: s.quantity, min: s.min,
      state: s.quantity === 0 ? 'Hết hàng' : s.quantity <= s.min ? 'Dưới ngưỡng' : 'Bình thường',
      short: Math.max(0, s.min - s.quantity),
    };
  });
  const docRows = (kind: DocKind) => kindDocs(kind).map((d) => ({ date: d.date, docId: d.id, partner: partnerName(d.partnerId), status: d.status, amount: documentAmount(d) }));
  const docLineRows = (kind: DocKind) => kindDocs(kind).flatMap((d) => d.lines.map((l) => ({
    date: d.date, docId: d.id, partner: partnerName(d.partnerId), product: productName(l.productId),
    unit: productUnit(l.productId), quantity: l.quantity, unitPrice: l.unitPrice, amount: l.quantity * l.unitPrice,
  })));
  const partnerRows = (kind: DocKind) => [...groupTotals(kindDocs(kind), (d) => d.partnerId, documentAmount).entries()]
    .map(([code, a]) => ({ code, partner: partnerName(code), count: a.count, amount: a.value }))
    .sort((a, b) => b.amount - a.amount);
  const productRows = (kind: DocKind) => {
    const agg = new Map<string, { quantity: number; amount: number }>();
    for (const d of kindDocs(kind)) for (const l of d.lines) {
      const value = agg.get(l.productId) ?? { quantity: 0, amount: 0 };
      value.quantity += l.quantity;
      value.amount += l.quantity * l.unitPrice;
      agg.set(l.productId, value);
    }
    return [...agg.entries()].map(([code, value]) => ({ code, product: productName(code), unit: productUnit(code), ...value }))
      .sort((a, b) => b.quantity - a.quantity || a.code.localeCompare(b.code));
  };
  const pendingDocs = (kind: DocKind) => documents.filter((d) => d.kind === kind && getDocumentProgress(db, d).status !== 'complete')
    .map((d) => {
      const p = getDocumentProgress(db, d);
      return { date: d.date, docId: d.id, partner: partnerName(d.partnerId), status: d.status, progress: p.label, pending: p.pendingCount };
    });
  const movementRows = (kind: StockMovementV2['kind']) => confirmedMovements.filter((m) => m.kind === kind).flatMap((m) => m.lines.map((l) => ({
    date: m.date, movementId: m.id, source: m.sourceDocId ?? 'Phiếu độc lập',
    product: productName(l.productId), unit: productUnit(l.productId), quantity: l.quantity, status: 'Đã xác nhận',
  })));
  const invoices = (kind: DocKind) => invoiceRows.filter((i) => i.kind === kind).map((i) => ({
    date: i.date, invoiceId: i.id, number: i.number, symbol: i.symbol,
    docId: i.docId, partner: partnerName(db.docs.find((d) => d.id === i.docId)?.partnerId ?? ''),
    status: i.status === 'confirmed' ? 'Đã xác nhận' : 'Bản nháp',
  }));
  const note = definition.note ?? (definition.timeframe === 'current'
    ? 'Dữ liệu phản ánh hiện trạng tại thời điểm mở báo cáo; chọn kỳ thời gian không tái dựng tồn kho quá khứ.'
    : 'Số liệu quản trị tính từ bản ghi demo; chưa được kế toán phê duyệt công thức.');
  let rows: ReportRow[] = [];

  switch (id) {
    case 'buy-summary': rows = docRows('buy'); break;
    case 'buy-lines': rows = docLineRows('buy'); break;
    case 'buy-partners': rows = partnerRows('buy'); break;
    case 'buy-products': rows = productRows('buy'); break;
    case 'buy-pending': rows = pendingDocs('buy'); break;
    case 'sell-summary': rows = docRows('sell'); break;
    case 'sell-lines': rows = docLineRows('sell'); break;
    case 'sell-partners': rows = partnerRows('sell'); break;
    case 'sell-products': rows = productRows('sell'); break;
    case 'sell-top': rows = productRows('sell').map((row, index) => ({ rank: index + 1, ...row })); break;
    case 'sell-pending': rows = pendingDocs('sell'); break;
    case 'stock-current': rows = stocks; break;
    case 'stock-low': rows = stocks.filter((s) => s.stock <= s.min); break;
    case 'stock-zero': rows = stocks.filter((s) => s.stock === 0); break;
    case 'stock-in': rows = movementRows('Nhập kho'); break;
    case 'stock-out': rows = movementRows('Xuất kho'); break;
    case 'stock-flow': {
      const totals = new Map<string, { received: number; issued: number }>();
      for (const m of confirmedMovements) for (const l of m.lines) {
        const prev = totals.get(l.productId) ?? { received: 0, issued: 0 };
        if (m.kind === 'Nhập kho') prev.received += l.quantity;
        else prev.issued += l.quantity;
        totals.set(l.productId, prev);
      }
      rows = stocks.map((s) => ({ code: s.code, product: s.product, unit: s.unit,
        received: totals.get(s.code)?.received ?? 0, issued: totals.get(s.code)?.issued ?? 0, stock: s.stock }));
      break;
    }
    case 'stock-locations': rows = [...stocks].sort((a, b) => a.location.localeCompare(b.location) || a.code.localeCompare(b.code)); break;
    case 'stock-checks': rows = db.stockChecks.filter((s) => matchesDateFilter(s.date, period))
      .map((s) => ({ date: s.date, movementId: s.id, status: s.status, note: s.note })); break;
    case 'invoice-buy': rows = invoices('buy'); break;
    case 'invoice-sell': rows = invoices('sell'); break;
    case 'invoice-pending': rows = invoiceRows.filter((i) => i.status === 'draft')
      .map((i) => ({ date: i.date, invoiceId: i.id, direction: i.kind === 'buy' ? 'Đầu vào' : 'Đầu ra', docId: i.docId, number: i.number, status: 'Bản nháp' })); break;
    case 'invoice-missing': rows = documents.filter((d) => !db.invoices.some((i) => i.docId === d.id))
      .map((d) => ({ date: d.date, docId: d.id, direction: d.kind === 'buy' ? 'Mua' : 'Bán', partner: partnerName(d.partnerId), status: d.status })); break;
    case 'manage-attention': rows = documents.flatMap((d) => {
      const state = getDocumentAttention(db, d);
      return state.needsReview ? [{ date: d.date, docId: d.id, direction: d.kind === 'buy' ? 'Mua' : 'Bán',
        partner: partnerName(d.partnerId), status: d.status, reason: state.reasons.join('; ') }] : [];
    }); break;
    case 'manage-progress': rows = documents.flatMap((d) => getDocumentProgress(db, d).rows.map((line) => ({
      date: d.date, docId: d.id, product: productName(line.productId), unit: productUnit(line.productId),
      required: line.ordered, confirmed: line.confirmed, remaining: line.remaining, pending: line.pending,
    }))); break;
    case 'manage-warehouse': rows = movements.filter((m) => m.status === 'draft').map((m) => ({
      date: m.date, movementId: m.id, direction: m.kind, source: m.sourceDocId ?? 'Phiếu độc lập',
      lines: m.lines.length, note: m.note,
    })); break;
    case 'manage-products': rows = db.products.map((p) => ({ code: p.id, product: p.name, category: p.category, unit: p.unit, spec: p.spec, supplier: partnerName(p.supplierId) })); break;
    case 'manage-partners': rows = db.partners.map((p) => ({ code: p.id, partner: p.name, direction: p.type === 'supplier' ? 'Nhà cung cấp' : 'Khách hàng', phone: p.phone, address: p.address })); break;
    default: rows = [];
  }
  // Stable report rows; sort transaction rows by date descending unless report is an ordered ranking.
  if (definition.timeframe === 'transaction' && id !== 'sell-top' && rows.length > 0 && 'date' in rows[0]) {
    rows.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
  }
  return { definition, rows, note };
}

export function filterReportRows(rows: readonly ReportRow[], query: string): ReportRow[] {
  const needle = query.trim().toLocaleLowerCase('vi');
  if (!needle) return [...rows];
  return rows.filter((r) => Object.values(r).some((v) => String(v ?? '').toLocaleLowerCase('vi').includes(needle)));
}

export function reportPeriodLabel(period: DateFilterValue, timeframe: ReportDefinition['timeframe']): string {
  if (timeframe === 'current') return 'Hiện trạng tại thời điểm xuất';
  switch (period.mode) {
    case 'day': return period.day ? `Ngày ${period.day}` : 'Tất cả thời gian';
    case 'range': return `Từ ${period.from || 'đầu kỳ'} đến ${period.to || 'hiện tại'}`;
    case 'week': return period.week ? `Tuần ${period.week}` : 'Tất cả thời gian';
    case 'month': return period.month ? `Tháng ${period.month}` : 'Tất cả thời gian';
    case 'year': return period.year ? `Năm ${period.year}` : 'Tất cả thời gian';
    default: return 'Tất cả thời gian';
  }
}
