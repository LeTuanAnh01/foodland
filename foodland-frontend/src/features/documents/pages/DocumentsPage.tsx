import * as React from 'react';
import { Download, ListFilter, Plus, RotateCcw } from 'lucide-react';
import { DateFilter, SearchInput, SectionCard, Tabs } from '@/components/shared';
import { EMPTY_DATE_FILTER, matchesDateFilter } from '@/lib/dateFilter';
import type { DateFilterValue } from '@/lib/dateFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFoodland, subtotal } from '@/data/store';
import type { DocKind } from '@/data/types';
import { downloadCsv } from '@/lib/utils';
import { DocumentTable } from '../components/DocumentTable';
import { DocumentFormModal } from '../components/DocumentFormModal';
import { DocumentDetailModal } from '../components/DocumentDetailModal';
import { documentVerb, invoiceTitle } from '../utils/documentLabels';
import { movementKindForDoc } from '../utils/documentWorkflow';
import { getDocumentAttention, sortDocuments } from '../utils/documentAttention';
import type { DocumentSort, InvoiceReviewStatus } from '../utils/documentAttention';
import { getDocumentProgress } from '../utils/documentProgress';
import type { FulfillmentStatus } from '../utils/documentProgress';
import { StockMovementForm } from '@/features/inventory/components/StockMovementForm';
import { InvoiceFlowModal } from '@/features/invoices/components/InvoiceFlowModal';
import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';

type WorkflowFilter = 'all' | 'needsReview' | 'done';
type DocumentStatusFilter = 'all' | 'Bản nháp' | 'Đã xác nhận';
type ProgressFilter = 'all' | FulfillmentStatus;
type InvoiceFilter = 'all' | InvoiceReviewStatus;
type InvoiceListFilter = 'all' | 'draft' | 'confirmed';

const selectClass = 'h-9 max-w-full rounded-lg border border-[#dce7df] bg-white px-3 text-xs text-[#32483a] outline-none focus:border-emerald-500';

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium text-slate-600">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function DocumentsPage({ kind }: { kind: DocKind }) {
  const { db } = useFoodland();
  const [tab, setTab] = React.useState('docs');
  const [search, setSearch] = React.useState('');
  const [workflowFilter, setWorkflowFilter] = React.useState<WorkflowFilter>('all');
  const [docStatusFilter, setDocStatusFilter] = React.useState<DocumentStatusFilter>('all');
  const [progressFilter, setProgressFilter] = React.useState<ProgressFilter>('all');
  const [invoiceFilter, setInvoiceFilter] = React.useState<InvoiceFilter>('all');
  const [invoiceListFilter, setInvoiceListFilter] = React.useState<InvoiceListFilter>('all');
  const [sort, setSort] = React.useState<DocumentSort>('pending');
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue>({ ...EMPTY_DATE_FILTER });
  const [modal, setModal] = React.useState<'doc' | 'invoice' | null>(null);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [editingDocId, setEditingDocId] = React.useState<string | null>(null);
  const [creatingStockDocId, setCreatingStockDocId] = React.useState<string | null>(null);

  const clearFilters = () => {
    setSearch('');
    setWorkflowFilter('all');
    setDocStatusFilter('all');
    setProgressFilter('all');
    setInvoiceFilter('all');
    setInvoiceListFilter('all');
    setSort('pending');
    setDateFilter({ ...EMPTY_DATE_FILTER });
  };

  // Khi đi từ Mua hàng sang Bán hàng, không giữ bộ lọc của trang trước.
  React.useEffect(() => { setTab('docs'); clearFilters(); }, [kind]);

  const partnerName = (id: string) => db.partners.find((p) => p.id === id)?.name || '—';
  const allDocs = db.docs.filter((doc) => doc.kind === kind);
  const allInvoices = db.invoices.filter((invoice) => invoice.kind === kind);
  const progressOf = (doc: (typeof db.docs)[number]) => getDocumentProgress(db, doc);
  const reviewOf = (doc: (typeof db.docs)[number]) => getDocumentAttention(db, doc);
  // Thống kê luôn từ toàn bộ chứng từ, KHÔNG từ danh sách đã tìm kiếm/lọc.
  const progressCounts = allDocs.reduce((counts, doc) => {
    counts[progressOf(doc).status]++;
    if (reviewOf(doc).needsReview) counts.needsReview++;
    return counts;
  }, { none: 0, partial: 0, complete: 0, needsReview: 0 });

  const keyword = search.trim().toLocaleLowerCase('vi-VN');
  const filteredDocs = allDocs.filter((doc) => {
    const review = reviewOf(doc);
    const content = `${doc.id} ${doc.note} ${partnerName(doc.partnerId)}`.toLocaleLowerCase('vi-VN');
    return content.includes(keyword)
      && matchesDateFilter(doc.date, dateFilter)
      && (workflowFilter === 'all' || (workflowFilter === 'needsReview' ? review.needsReview : !review.needsReview))
      && (docStatusFilter === 'all' || doc.status === docStatusFilter)
      && (progressFilter === 'all' || review.progress.status === progressFilter)
      && (invoiceFilter === 'all' || review.invoiceStatus === invoiceFilter);
  });
  const docs = sortDocuments(db, filteredDocs, sort);

  const invoices = allInvoices.filter((invoice) => (
    `${invoice.number} ${invoice.docId} ${invoice.symbol}`.toLocaleLowerCase('vi-VN').includes(keyword)
    && (invoiceListFilter === 'all' || invoice.status === invoiceListFilter)
    && matchesDateFilter(invoice.date, dateFilter)
  )).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const pageName = kind === 'buy' ? 'Mua hàng' : 'Bán hàng';
  const selected = db.docs.find((doc) => doc.id === selectedDocId && doc.kind === kind);
  const editing = db.docs.find((doc) => doc.id === editingDocId && doc.kind === kind);
  const stockSource = db.docs.find((doc) => doc.id === creatingStockDocId && doc.kind === kind);
  const draftInvoiceCount = allInvoices.filter((invoice) => invoice.status === 'draft').length;
  const latestDate = (tab === 'docs' ? allDocs : allInvoices)
    .reduce((max, item) => item.date > max ? item.date : max, '');

  return (
    <>
      <SectionCard
        title={`${pageName} – danh sách`}
        subtitle="Chứng từ cần xử lý được ưu tiên. Thống kê bên dưới luôn tính trên toàn bộ chứng từ, kể cả những chứng từ không xuất hiện trong kết quả lọc."
        right={<Button onClick={() => setModal(tab === 'docs' ? 'doc' : 'invoice')}>
          <Plus /> {tab === 'docs' ? `Thêm chứng từ ${documentVerb(kind)}` : invoiceTitle(kind)}
        </Button>}
      >
        <Tabs active={tab} onChange={(next) => { setTab(next); setSearch(''); setDateFilter({ ...EMPTY_DATE_FILTER }); }} items={[
          { id: 'docs', label: `Chứng từ ${documentVerb(kind)}${progressCounts.needsReview ? ` · ${progressCounts.needsReview} cần xử lý` : ''}` },
          { id: 'invoices', label: `${kind === 'buy' ? 'Nhận hóa đơn' : 'Hóa đơn bán hàng'}${draftInvoiceCount ? ` · ${draftInvoiceCount} nháp` : ''}` },
        ]} />

        {tab === 'docs' && (
          <div className="border-b border-[#e9efe9] bg-slate-50/70 px-5 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-xs text-slate-700">
                {kind === 'buy' ? 'Tình trạng nhập kho' : 'Tình trạng xuất kho'} · Toàn bộ {allDocs.length} chứng từ
              </strong>
              <span className="text-[11px] text-slate-500">Không thay đổi khi tìm kiếm hoặc lọc</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
              <div className="inline-flex items-center gap-2"><Badge tone="gray">{kind === 'buy' ? 'Chưa nhập' : 'Chưa xuất'}</Badge><strong>{progressCounts.none}</strong></div>
              <div className="inline-flex items-center gap-2"><Badge tone="orange">{kind === 'buy' ? 'Nhập một phần' : 'Xuất một phần'}</Badge><strong>{progressCounts.partial}</strong></div>
              <div className="inline-flex items-center gap-2"><Badge tone="green">{kind === 'buy' ? 'Đã nhập đủ' : 'Đã xuất đủ'}</Badge><strong>{progressCounts.complete}</strong></div>
              <div className="inline-flex items-center gap-2 border-l border-slate-200 pl-4"><Badge tone="orange">Cần xử lý</Badge><strong>{progressCounts.needsReview}</strong></div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              “Cần xử lý” gồm chứng từ chưa duyệt, chưa giao/nhận đủ, phiếu kho nháp hoặc hóa đơn chưa xác nhận/chưa có.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e9efe9] px-5 py-4">
          <SearchInput value={search} onChange={setSearch} placeholder={tab === 'docs' ? 'Tìm số chứng từ, đối tác, ghi chú...' : 'Tìm số hóa đơn, ký hiệu, chứng từ...'} />
          <Button variant="outline" size="sm" onClick={() => tab === 'docs'
            ? downloadCsv('foodland-chung-tu.csv', ['Mã', 'Ngày', 'Đối tác', 'Giá trị', 'Số hóa đơn', 'Trạng thái chứng từ', 'Trạng thái kho', 'Tình trạng xử lý'], docs.map((doc) => [doc.id, doc.date, partnerName(doc.partnerId), subtotal(doc), doc.invoiceNo, doc.status, progressOf(doc).label, reviewOf(doc).needsReview ? reviewOf(doc).reasons.join('; ') : 'Không còn việc cần xử lý']))
            : downloadCsv('foodland-hoa-don.csv', ['Mã', 'Số hóa đơn', 'Ký hiệu', 'Ngày', 'Chứng từ liên kết', 'Trạng thái'], invoices.map((invoice) => [invoice.id, invoice.number, invoice.symbol, invoice.date, invoice.docId, invoice.status === 'draft' ? 'Bản nháp' : 'Đã xác nhận']))}>
            <Download /> Xuất CSV
          </Button>
        </div>

        {tab === 'docs' ? (
          <div className="border-b border-[#e9efe9] bg-white px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-700"><ListFilter size={15} /> Bộ lọc chứng từ</div>
            <div className="flex flex-wrap items-end gap-3">
              <FilterSelect label="Công việc" value={workflowFilter} onChange={(value) => setWorkflowFilter(value as WorkflowFilter)} options={[
                { value: 'all', label: 'Tất cả' }, { value: 'needsReview', label: 'Cần xử lý' }, { value: 'done', label: 'Không còn việc cần xử lý' },
              ]} />
              <FilterSelect label="Trạng thái kho" value={progressFilter} onChange={(value) => setProgressFilter(value as ProgressFilter)} options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'none', label: kind === 'buy' ? 'Chưa nhập' : 'Chưa xuất' },
                { value: 'partial', label: kind === 'buy' ? 'Nhập một phần' : 'Xuất một phần' },
                { value: 'complete', label: kind === 'buy' ? 'Đã nhập đủ' : 'Đã xuất đủ' },
              ]} />
              <FilterSelect label="Trạng thái chứng từ" value={docStatusFilter} onChange={(value) => setDocStatusFilter(value as DocumentStatusFilter)} options={[
                { value: 'all', label: 'Tất cả' }, { value: 'Bản nháp', label: 'Bản nháp' }, { value: 'Đã xác nhận', label: 'Đã xác nhận' },
              ]} />
              <FilterSelect label="Hóa đơn" value={invoiceFilter} onChange={(value) => setInvoiceFilter(value as InvoiceFilter)} options={[
                { value: 'all', label: 'Tất cả' }, { value: 'missing', label: 'Chưa có' }, { value: 'draft', label: 'Chưa xác nhận' }, { value: 'confirmed', label: 'Đã xác nhận' },
              ]} />
              <FilterSelect label="Sắp xếp" value={sort} onChange={(value) => setSort(value as DocumentSort)} options={[
                { value: 'pending', label: 'Cần xử lý trước' }, { value: 'newest', label: 'Mới nhất' }, { value: 'oldest', label: 'Cũ nhất' },
              ]} />
              <Button variant="outline" size="sm" onClick={clearFilters}><RotateCcw size={14} /> Xóa lọc</Button>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <DateFilter value={dateFilter} onChange={setDateFilter} latestDate={latestDate} label="Ngày chứng từ" />
            </div>
            <p className="mt-3 text-[11px] text-slate-500">Đang hiển thị {docs.length} chứng từ sau lọc · Mặc định đưa chứng từ chưa giao/nhận đủ lên trên, ưu tiên việc cũ.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3 border-b border-[#e9efe9] px-5 py-4">
            <FilterSelect label="Tình trạng hóa đơn" value={invoiceListFilter} onChange={(value) => setInvoiceListFilter(value as InvoiceListFilter)} options={[
              { value: 'all', label: 'Tất cả' }, { value: 'draft', label: 'Chờ xác nhận' }, { value: 'confirmed', label: 'Đã xác nhận' },
            ]} />
            <DateFilter value={dateFilter} onChange={setDateFilter} latestDate={latestDate} label="Ngày hóa đơn" />
            <Button variant="outline" size="sm" onClick={clearFilters}><RotateCcw size={14} /> Xóa lọc</Button>
            <span className="w-full text-[11px] text-slate-500">Đang hiển thị {invoices.length} hóa đơn sau lọc.</span>
          </div>
        )}

        {tab === 'docs'
          ? <DocumentTable key={`${kind}-${search}-${workflowFilter}-${docStatusFilter}-${progressFilter}-${invoiceFilter}-${sort}-${JSON.stringify(dateFilter)}`} documents={docs} movements={db.stockMovements} invoices={db.invoices} total={allDocs.length} partnerName={partnerName} onView={setSelectedDocId} />
          : <InvoiceTable key={`${kind}-${search}-${invoiceListFilter}-${JSON.stringify(dateFilter)}`} invoices={invoices} total={allInvoices.length} docs={db.docs} partnerName={partnerName} />}
      </SectionCard>
      {modal === 'doc' && <DocumentFormModal kind={kind} onClose={() => setModal(null)} onSaved={() => { setModal(null); setTab('docs'); }} />}
      {modal === 'invoice' && <InvoiceFlowModal kind={kind} onClose={() => setModal(null)} onSaved={() => { setModal(null); setTab('invoices'); }} />}
      {selected && <DocumentDetailModal doc={selected} onClose={() => setSelectedDocId(null)} onEdit={() => { setEditingDocId(selected.id); setSelectedDocId(null); }} onCreateStock={() => { setCreatingStockDocId(selected.id); setSelectedDocId(null); }} />}
      {editing && <DocumentFormModal kind={kind} document={editing} onClose={() => setEditingDocId(null)} onSaved={() => { setSelectedDocId(editing.id); setEditingDocId(null); }} />}
      {stockSource && <StockMovementForm
        kind={movementKindForDoc(kind)}
        sourceDoc={stockSource}
        onClose={() => { setCreatingStockDocId(null); setSelectedDocId(stockSource.id); }}
        onSaved={() => { setCreatingStockDocId(null); setSelectedDocId(stockSource.id); }}
      />}
    </>
  );
}
