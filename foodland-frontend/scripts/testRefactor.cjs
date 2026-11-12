/* Regression coverage for the v0.8 separation of Store, domain and persistence. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const base = path.resolve(__dirname, '..');
const cache = new Map();
const browserStore = new Map();
const fakeLocalStorage = {
  getItem: (key) => browserStore.get(key) ?? null,
  setItem: (key, value) => browserStore.set(key, String(value)),
  removeItem: (key) => browserStore.delete(key),
};
function load(relative) {
  const file = path.resolve(base, relative);
  if (cache.has(file)) return cache.get(file);
  const exported = {};
  cache.set(file, exported);
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  function resolve(name) {
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith('./') || name.startsWith('../')) {
      return load(path.relative(base, path.resolve(path.dirname(file), `${name}.ts`)));
    }
    throw new Error(`Unexpected import ${name}`);
  }
  vm.runInNewContext(js, { exports: exported, require: resolve, structuredClone, localStorage: fakeLocalStorage, console }, { filename: file });
  return exported;
}
const { initial } = load('src/data/mocks/initialData.ts');
const command = load('src/data/services/foodlandCommands.ts');
const { createMemoryDataRepository } = load('src/data/repositories/demoDataRepository.ts');
const { getDocumentProgress } = load('src/features/documents/utils/documentProgress.ts');
const { createHttpClient, HttpError } = load('src/data/api/httpClient.ts');
const { loadDemoData, saveDemoData } = load('src/data/repositories/localStorageRepository.ts');

const seed = () => structuredClone(initial);
const newDoc = (id, kind, partnerId, productId, qty) => ({
  id, kind, partnerId, date: '2026-10-23', note: '', status: 'Bản nháp', invoiceNo: '',
  lines: [{ productId, quantity: qty, unitPrice: 12000 }],
});
const newMove = (id, kind, docId, productId, qty) => ({
  id, kind, sourceDocId: docId, date: '2026-10-23', note: '', status: 'draft',
  lines: [{ productId, quantity: qty }],
});
const ok = (value, msg) => assert.equal(value.result.ok, true, msg);
let checks = 0;
const test = (name, fn) => { fn(); ++checks; console.log('PASS', name); };

test('Tạo và duyệt chứng từ: không thay đổi dữ liệu đầu vào', () => {
  const db = seed();
  const doc = newDoc('BH9000', 'sell', 'KH001', 'SP0001', 20);
  const r = command.saveDocument(db, doc);
  ok(r); assert.equal(db.docs.some((x) => x.id === doc.id), false);
  assert.equal(r.db.docs[0].status, 'Bản nháp');
  const c = command.confirmDocument(r.db, doc.id);
  ok(c); assert.equal(c.db.docs[0].status, 'Đã xác nhận');
  assert.equal(command.confirmDocument(c.db, doc.id).result.ok, false);
});

test('Xóa chứng từ nháp và từ chối xóa chứng từ đã xác nhận', () => {
  const db = seed();
  const doc = newDoc('BH9001', 'sell', 'KH001', 'SP0001', 20);
  const r = command.saveDocument(db, doc);
  ok(r);
  ok(command.deleteDocument(r.db, doc.id));
  const confirmed = command.confirmDocument(r.db, doc.id).db;
  assert.equal(command.deleteDocument(confirmed, doc.id).result.ok, false);
});

test('Xác nhận hóa đơn không làm thay đổi tồn kho', () => {
  let db = seed();
  const doc = newDoc('NK9001', 'buy', 'NCC01', 'SP0001', 10);
  db = command.confirmDocument(command.saveDocument(db, doc).db, doc.id).db;
  const quantityBefore = db.stocks.find((s) => s.productId === 'SP0001').quantity;
  const invoice = { id: 'HD9001', docId: doc.id, kind: 'buy', number: '900001', symbol: 'C26', date: doc.date, status: 'draft', note: '' };
  const r = command.saveInvoice(db, invoice);
  ok(r); assert.equal(command.saveInvoice(r.db, invoice).result.ok, false);
  const c = command.confirmInvoice(r.db, invoice.id);
  ok(c); assert.equal(c.db.stocks.find((s) => s.productId === 'SP0001').quantity, quantityBefore);
});

test('Nhập kho nhiều đợt chỉ cộng khi xác nhận phiếu', () => {
  let db = seed();
  const doc = newDoc('NK9002', 'buy', 'NCC01', 'SP0001', 10);
  db = command.confirmDocument(command.saveDocument(db, doc).db, doc.id).db;
  const before = db.stocks.find((s) => s.productId === 'SP0001').quantity;
  const one = newMove('PN9001', 'Nhập kho', doc.id, 'SP0001', 6);
  db = command.saveStockMovement(db, one).db;
  assert.equal(db.stocks.find((s) => s.productId === 'SP0001').quantity, before);
  const tooMany = command.saveStockMovement(db, newMove('PN9002', 'Nhập kho', doc.id, 'SP0001', 5));
  assert.equal(tooMany.result.ok, false);
  const first = command.confirmStockMovement(db, one.id);
  ok(first); db = first.db;
  assert.equal(db.stocks.find((s) => s.productId === 'SP0001').quantity, before + 6);
  assert.equal(getDocumentProgress(db, doc).status, 'partial');
  const two = newMove('PN9002', 'Nhập kho', doc.id, 'SP0001', 4);
  db = command.saveStockMovement(db, two).db;
  db = command.confirmStockMovement(db, two.id).db;
  assert.equal(getDocumentProgress(db, doc).status, 'complete');
  assert.equal(command.confirmStockMovement(db, two.id).result.ok, false);
});

test('Xuất thiếu một dòng không trừ mặt hàng nào', () => {
  let db = seed();
  const before = db.stocks.map((stock) => stock.quantity);
  const movement = {
    ...newMove('PX9001', 'Xuất kho', undefined, 'SP0001', 2),
    lines: [{ productId: 'SP0001', quantity: 2 }, { productId: 'SP0002', quantity: 999 }],
  };
  db = command.saveStockMovement(db, movement).db;
  const attempt = command.confirmStockMovement(db, movement.id);
  assert.equal(attempt.result.ok, false);
  assert.equal(attempt.db, db);
  assert.deepEqual(Array.from(db.stocks, (s) => s.quantity), before);
});

test('Store command sửa/xóa phiếu nháp và khóa phiếu đã xác nhận', () => {
  let db = seed();
  const movement = newMove('PX9002', 'Xuất kho', undefined, 'SP0001', 2);
  db = command.saveStockMovement(db, movement).db;
  const modified = { ...movement, lines: [{ productId: 'SP0001', quantity: 3 }] };
  db = command.saveStockMovement(db, modified).db;
  assert.equal(db.stockMovements.find((m) => m.id === movement.id).lines[0].quantity, 3);
  db = command.confirmStockMovement(db, movement.id).db;
  assert.equal(command.saveStockMovement(db, modified).result.ok, false);
  assert.equal(command.deleteStockMovement(db, movement.id).stockMovements.some((m) => m.id === movement.id), true);
});

test('Repository bộ nhớ không chia sẻ tham chiếu với bên ngoài', () => {
  const source = seed();
  const repo = createMemoryDataRepository(source);
  source.products[0].name = 'Sửa ở ngoài';
  assert.notEqual(repo.load().products[0].name, 'Sửa ở ngoài');
  const snapshot = repo.load();
  snapshot.products[0].name = 'Không được lưu';
  assert.notEqual(repo.load().products[0].name, 'Không được lưu');
  repo.save(snapshot);
  assert.equal(repo.load().products[0].name, 'Không được lưu');
});

test('Không đổi LocalStorage key/schema và vẫn migrate phiếu v0.4', () => {
  browserStore.clear();
  const snapshot = seed();
  snapshot.stockMovements = [
    { id: 'PNOLD', kind: 'Nhập kho', date: '2026-10-20', productId: 'SP0001', qty: 7, note: '' },
  ];
  fakeLocalStorage.setItem('foodland-react-prototype-v1', JSON.stringify(snapshot));
  const loaded = loadDemoData();
  assert.equal(loaded.stockMovements[0].lines[0].quantity, 7);
  assert.equal(loaded.stockMovements[0].status, 'draft');
  assert.equal(loaded.products.length, snapshot.products.length);
  assert.ok(fakeLocalStorage.getItem('foodland-react-prototype-v1-backup-v0.4'));
  saveDemoData(loaded);
  assert.equal(JSON.parse(fakeLocalStorage.getItem('foodland-react-prototype-v1')).stockMovements[0].lines[0].quantity, 7);
  browserStore.clear();
});

(async () => {
  let calls = [];
  const client = createHttpClient('https://example.test/api/', async (url, opts) => {
    calls.push([url, opts]);
    return { ok: true, status: 200, json: async () => ({ items: [], totalItems: 0, page: 1, pageSize: 10 }) };
  });
  const result = await client.get('/products?page=1');
  assert.equal(result.totalItems, 0);
  assert.equal(calls[0][0], 'https://example.test/api/products?page=1');
  ++checks; console.log('PASS HTTP client trả về dữ liệu có phân trang');
  const fail = createHttpClient('https://example.test', async () => ({ ok: false, status: 503 }));
  await assert.rejects(() => fail.get('/products'), (error) => error instanceof HttpError && error.status === 503);
  ++checks; console.log('PASS HTTP client xử lý lỗi HTTP');
  console.log(`PASSED ${checks} v0.8 refactor checks`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
