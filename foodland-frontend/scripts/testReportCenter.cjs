const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { join, resolve } = require('node:path');
const Module = require('node:module');
const { existsSync, rmSync, writeFileSync } = require('node:fs');
const build = resolve('.report-test-build');
rmSync(build, { recursive: true, force: true });
const cmd = spawnSync('tsc', ['-p', 'tsconfig.report-center-test.json'], { encoding: 'utf8' });
assert.equal(cmd.status, 0, cmd.stdout + cmd.stderr);
writeFileSync(join(build, 'package.json'), '{"type":"commonjs"}');
// Alias for Node-only test runtime (Vite resolves @/ in the actual browser).
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) request = join(build, request.slice(2));
  return originalResolve.call(this, request, parent, ...rest);
};
try {
  const { reportCatalog } = require(join(build, 'features/reports/center/catalog.js'));
  const { buildReport, filterReportRows } = require(join(build, 'features/reports/center/reportData.js'));
  const { initial } = require(join(build, 'data/mocks/initialData.js'));
  const none = { mode: 'all', day: '', from: '', to: '', week: '', month: '', year: '' };
  const october = { ...none, mode: 'month', month: '2026-10' };
  const december = { ...none, mode: 'month', month: '2026-12' };
  let cases = 0;
  function check(description, fn) { fn(); cases++; console.log(`✓ ${description}`); }
  check('có từ 30 mẫu, mỗi mẫu có cột duy nhất', () => {
    assert.ok(reportCatalog.length >= 30);
    assert.equal(new Set(reportCatalog.map((r) => r.id)).size, reportCatalog.length);
    reportCatalog.forEach((r) => {
      assert.ok(r.columns.length >= 3);
      assert.equal(new Set(r.columns.map((c) => c.key)).size, r.columns.length);
    });
  });
  check('tất cả các mẫu build được không bị lỗi', () => {
    reportCatalog.forEach((r) => assert.equal(buildReport(initial, r.id, none).definition.id, r.id));
  });
  check('mẫu tài chính chưa có dữ liệu không bịa số liệu', () => {
    reportCatalog.filter((r) => r.mode === 'layout').forEach((r) => assert.deepEqual(buildReport(initial, r.id, none).rows, []));
  });
  check('chỉ cộng chứng từ đã xác nhận vào báo cáo giá trị', () => {
    const rows = buildReport(initial, 'sell-summary', october).rows;
    assert.equal(rows.length, 2);
    assert.ok(!rows.some((r) => r.docId === 'BH00002'));
    assert.equal(rows.reduce((sum, r) => sum + r.amount, 0), 360000 + 912000);
  });
  check('mẫu chi tiết nhiều dòng không bỏ qua dòng nào', () => {
    const next = structuredClone(initial);
    next.docs.find((d) => d.id === 'BH00001').lines.push({ productId: 'SP0002', quantity: 5, unitPrice: 20000 });
    const result = buildReport(next, 'sell-lines', october);
    assert.equal(result.rows.length, 3);
    assert.equal(result.rows.filter((r) => r.docId === 'BH00001').length, 2);
  });
  check('kỳ không có giao dịch trả rỗng', () => assert.equal(buildReport(initial, 'buy-summary', december).rows.length, 0));
  check('báo cáo tồn hiện tại không phụ thuộc bộ lọc ngày', () => {
    assert.deepEqual(buildReport(initial, 'stock-current', none).rows, buildReport(initial, 'stock-current', december).rows);
  });
  check('báo cáo dưới ngưỡng chỉ lấy tồn <= min', () => {
    const rows = buildReport(initial, 'stock-low', none).rows;
    assert.ok(rows.length > 0);
    assert.ok(rows.every((r) => r.stock <= r.min));
  });
  check('hàng hết tồn khác với dưới ngưỡng', () => assert.ok(buildReport(initial, 'stock-zero', none).rows.every((r) => r.stock === 0)));
  check('phiếu nháp không được coi là đã nhập/xuất', () => {
    assert.equal(buildReport(initial, 'stock-in', october).rows.length, 0);
    assert.equal(buildReport(initial, 'stock-out', october).rows.length, 0);
  });
  check('thêm phiếu xác nhận được tính vào biến động', () => {
    const next = structuredClone(initial);
    next.stockMovements.push({ id: 'PN9999', date: '2026-10-15', kind: 'Nhập kho', status: 'confirmed', lines: [
      { productId: 'SP0001', quantity: 6 }, { productId: 'SP0002', quantity: 3 },
    ], note: '', stockApplied: true });
    assert.equal(buildReport(next, 'stock-in', october).rows.length, 2);
    assert.equal(buildReport(next, 'stock-flow', october).rows.find((r) => r.code === 'SP0001').received, 6);
  });
  check('không cộng các đơn vị khác nhau ở bảng số lượng mặt hàng', () => {
    const rows = buildReport(initial, 'sell-products', none).rows;
    assert.ok(rows.every((r) => typeof r.unit === 'string' && typeof r.quantity === 'number'));
  });
  check('chứng từ chưa có hóa đơn hiển thị đúng', () => {
    const rows = buildReport(initial, 'invoice-missing', none).rows;
    assert.ok(rows.some((r) => r.docId === 'BH00003'));
    assert.ok(!rows.some((r) => r.docId === 'BH00001'));
  });
  check('lọc từ khóa áp dụng trên mọi cột', () => {
    const rows = buildReport(initial, 'manage-products', none).rows;
    assert.ok(filterReportRows(rows, 'SP0001').some((r) => r.code === 'SP0001'));
    assert.equal(filterReportRows(rows, 'không tồn tại 1234').length, 0);
  });
  check('báo cáo tiến độ trả về từng mặt hàng cần xuất', () => {
    const rows = buildReport(initial, 'manage-progress', none).rows;
    assert.ok(rows.some((r) => r.docId === 'BH00003' && r.remaining > 0));
  });
  console.log(`Đạt ${cases} kiểm thử Report Center v0.9`);
} finally {
  Module._resolveFilename = originalResolve;
  if (existsSync(build)) rmSync(build, { recursive: true, force: true });
}
