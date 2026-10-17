const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const root = path.resolve(__dirname, '../src');
const ts = require('typescript');
const originalResolver = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return originalResolver.call(this, request, parent, isMain, options);
};
Module._extensions['.ts'] = function (mod, filename) {
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  mod._compile(js, filename);
};
const { initial } = require(path.join(root, 'data/mocks/initialData.ts'));
const { getDocumentAttention, getPendingNavigationCounts, sortDocuments, countForNavigationPath } = require(path.join(root, 'features/documents/utils/documentAttention.ts'));
const { confirmMovementInDb } = require(path.join(root, 'features/inventory/utils/stockConfirmation.ts'));
const db = () => structuredClone(initial);
const makeDoc = (id, date, kind='sell') => ({
  id, date, kind, partnerId: kind === 'sell' ? 'KH001' : 'NCC01', note: '', status:'Đã xác nhận',invoiceNo:'',
  lines:[{productId:'SP0001',quantity:10,unitPrice:12000}],
});
const invoice = (docId, status='confirmed') => ({
  id:'HD-'+docId,docId,kind:'sell',date:'2026-10-17',number:'000'+docId,symbol:'C26',note:'',status,
});
const movement = (docId, id, qty, status='draft') => ({
  id,date:'2026-10-17',kind:'Xuất kho',status,sourceDocId:docId,stockApplied:status==='confirmed',note:'',
  lines:[{productId:'SP0001',quantity:qty}],
});
let n = 0;
function test(label, fn) { fn(); n++; console.log('PASS',label); }
test('Tính số việc của toàn bộ chứng từ kể cả chứng từ cũ', () => {
  const x = db();
  x.docs = [makeDoc('BH_OLD','2025-02-01'),makeDoc('BH_NEW','2026-10-17')];
  x.invoices = [invoice('BH_NEW')];
  x.stockMovements = [movement('BH_NEW','PX_NEW',10,'confirmed')];
  assert.equal(getDocumentAttention(x, x.docs[0]).needsReview,true);
  assert.equal(getDocumentAttention(x, x.docs[1]).needsReview,false);
  assert.equal(getPendingNavigationCounts(x).sales,1);
});
test('Chưa giao đủ hàng sẽ được ưu tiên trước dù cũ', () => {
  const x = db();
  const old = makeDoc('BH_OLD','2024-02-01');
  const newer = makeDoc('BH_NEW','2026-10-17');
  x.invoices = [invoice(old.id),invoice(newer.id)];
  x.stockMovements = [movement(newer.id,'PX_NEW',10,'confirmed')];
  assert.deepEqual(sortDocuments(x,[newer,old],'pending').map(d=>d.id),['BH_OLD','BH_NEW']);
  assert.deepEqual(sortDocuments(x,[newer,old],'newest').map(d=>d.id),['BH_NEW','BH_OLD']);
});
test('Hai chứng từ dở dang: việc cũ hơn ở đầu', () => {
  const x=db();
  const a=makeDoc('BH_OLD','2025-01-01');const b=makeDoc('BH_NEW','2026-01-01');
  assert.deepEqual(sortDocuments(x,[b,a],'pending').map(d=>d.id),['BH_OLD','BH_NEW']);
});
test('Phiếu nháp không làm hoàn thành giao hàng', () => {
  const x=db();const d=makeDoc('BH_TEST','2026-10-17');
  x.docs=[d];x.invoices=[invoice(d.id)];x.stockMovements=[movement(d.id,'PX_NEW',10)];
  const att=getDocumentAttention(x,d);
  assert.equal(att.progress.status,'none');
  assert.equal(att.progress.pendingCount,1);
  assert.equal(att.needsReview,true);
  assert.equal(getPendingNavigationCounts(x).inventory,1);
});
test('Hóa đơn chưa có hoặc còn nháp vẫn cần xử lý khi kho đủ', () => {
  const x=db();const d=makeDoc('BH_TEST','2026-10-17');x.docs=[d];
  x.stockMovements=[movement(d.id,'PX_NEW',10,'confirmed')];
  assert.equal(getDocumentAttention(x,d).invoiceStatus,'missing');
  x.invoices=[invoice(d.id,'draft')];
  assert.equal(getDocumentAttention(x,d).invoiceStatus,'draft');
  assert.equal(getDocumentAttention(x,d).needsReview,true);
  x.invoices=[invoice(d.id)];
  assert.equal(getDocumentAttention(x,d).needsReview,false);
});
test('Một chứng từ có nhiều việc chưa xong vẫn chỉ đếm một mục trong menu', () => {
  const x=db();const d=makeDoc('BH_TEST','2026-10-17');
  d.status='Bản nháp';x.docs=[d];x.invoices=[];
  assert.ok(getDocumentAttention(x,d).reasons.length >= 3);
  assert.equal(getPendingNavigationCounts(x).sales,1);
  assert.equal(countForNavigationPath('/sales',getPendingNavigationCounts(x)),1);
});
test('Xác nhận xuất kho làm mất cảnh báo kho khi hóa đơn đã xác nhận', () => {
  const x=db();const d=makeDoc('BH_TEST','2026-10-17');x.docs=[d];x.invoices=[invoice(d.id)];
  x.stockMovements=[movement(d.id,'PX_NEW',10)];
  assert.equal(getDocumentAttention(x,d).needsReview,true);
  const result=confirmMovementInDb(x,'PX_NEW');
  assert.equal(result.outcome.ok,true);
  assert.equal(getDocumentAttention(result.db,d).needsReview,false);
  assert.equal(getPendingNavigationCounts(result.db).sales,0);
  assert.equal(getPendingNavigationCounts(result.db).inventory,0);
});
test('Menu mua và bán tách riêng, Kho chỉ đếm phiếu chưa xác nhận', () => {
  const x=db();
  x.docs=[makeDoc('BH_TEST','2026-10-17'),makeDoc('NK_TEST','2026-10-17','buy')];
  x.stockMovements=[movement('BH_TEST','PX_A',10),movement('BH_TEST','PX_B',10,'confirmed')];
  assert.deepEqual(((o)=>[o.sales,o.purchases,o.inventory])(getPendingNavigationCounts(x)),[1,1,1]);
});
console.log(`PASSED ${n} attention checks`);
