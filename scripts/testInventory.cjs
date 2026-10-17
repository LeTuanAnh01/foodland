/* Kiểm thử logic xác nhận phiếu kho độc lập với giao diện React. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/inventory/utils/stockConfirmation.ts'),
  'utf8',
);
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const moduleExports = {};
const workflowSource = fs.readFileSync(
  path.join(__dirname, '../src/features/documents/utils/documentWorkflow.ts'),
  'utf8',
);
const workflowJs = ts.transpileModule(workflowSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const workflowExports = {};
vm.runInNewContext(workflowJs, { exports: workflowExports });
vm.runInNewContext(js, {
  exports: moduleExports,
  require: (name) => {
    if (name === '@/features/documents/utils/documentWorkflow') return workflowExports;
    throw new Error(`Unknown test dependency: ${name}`);
  },
});
const { checkStockMovement, confirmMovementInDb } = moduleExports;

const product = (id) => ({ id });
const stock = (id, quantity) => ({ productId: id, quantity, location: 'Kho chính', min: 0 });
const movement = (id, kind, lines) => ({ id, kind, lines, status: 'draft', date: '2026-10-17', note: '' });
const line = (productId, quantity) => ({ productId, quantity });
const seed = () => ({
  products: [product('A'), product('B')],
  stocks: [stock('A', 12), stock('B', 8)],
  stockMovements: [], docs: [], partners: [], invoices: [], stockChecks: [],
});

let db = seed();
db.stockMovements = [movement('PX1', 'Xuất kho', [line('A', 10), line('B', 9)])];
let result = confirmMovementInDb(db, 'PX1');
assert.equal(result.outcome.ok, false);
assert.equal(result.db, db, 'Không trừ một phần khi bất kỳ dòng hàng nào thiếu');
assert.equal(checkStockMovement(db.stockMovements[0], db).shortages[0].shortage, 1);

db = seed();
db.stockMovements = [movement('PN1', 'Nhập kho', [line('A', 10), line('B', 5)])];
result = confirmMovementInDb(db, 'PN1');
assert.equal(result.outcome.ok, true);
assert.equal(result.db.stocks[0].quantity, 22);
assert.equal(result.db.stocks[1].quantity, 13);
assert.equal(result.db.stockMovements[0].stockApplied, true);
assert.equal(confirmMovementInDb(result.db, 'PN1').outcome.ok, false, 'Không xác nhận hai lần');

db = seed();
db.stockMovements = [movement('PX2', 'Xuất kho', [line('A', 12)])];
result = confirmMovementInDb(db, 'PX2');
assert.equal(result.outcome.ok, true);
assert.equal(result.db.stocks[0].quantity, 0, 'Được phép xuất đúng bằng tồn');

db = seed();
db.stockMovements = [
  movement('PX3', 'Xuất kho', [line('A', 10)]),
  movement('PX4', 'Xuất kho', [line('A', 10)]),
];
const first = confirmMovementInDb(db, 'PX3');
const second = confirmMovementInDb(first.db, 'PX4');
assert.equal(first.outcome.ok, true);
assert.equal(second.outcome.ok, false, 'Phiếu thứ hai kiểm tra theo tồn mới nhất');
assert.equal(second.db.stocks[0].quantity, 2);

db = seed();
db.stockMovements = [movement('PX5', 'Xuất kho', [line('A', 2), line('A', 1)])];
assert.equal(confirmMovementInDb(db, 'PX5').outcome.ok, false, 'Chặn dòng hàng trùng');

db = seed();
db.stockMovements = [movement('PN5', 'Nhập kho', [line('A', -1)])];
assert.equal(confirmMovementInDb(db, 'PN5').outcome.ok, false, 'Chặn số lượng âm');

db = seed();
db.stocks = [stock('A', 1.2), stock('B', 8)];
db.stockMovements = [movement('PX6', 'Xuất kho', [line('A', 0.3)])];
result = confirmMovementInDb(db, 'PX6');
assert.equal(result.db.stocks[0].quantity, 0.9, 'Xử lý số lượng thập phân');

console.log('9 nhóm kiểm thử xác nhận nhập/xuất kho: PASS');
