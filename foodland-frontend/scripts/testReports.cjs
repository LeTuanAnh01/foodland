const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const temporary = mkdtempSync(join(tmpdir(), 'foodland-v07-reports-'));
try {
  writeFileSync(join(temporary, 'package.json'), '{"type":"commonjs"}');
  const result = spawnSync('tsc', [
    '--target', 'ES2022', '--module', 'commonjs', '--strict',
    '--skipLibCheck', '--outDir', temporary,
    'src/features/reports/utils/reportMetrics.ts',
    'src/lib/dateFilter.ts', 'src/data/types.ts',
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);

  const metrics = require(join(temporary, 'features/reports/utils/reportMetrics.js'));
  const date = require(join(temporary, 'lib/dateFilter.js'));
  const none = { ...date.EMPTY_DATE_FILTER };
  const period = { ...none, mode: 'month', month: '2026-10' };
  const dec = { ...none, mode: 'month', month: '2026-12' };
  let cases = 0;
  const check = (label, fn) => { fn(); cases++; console.log(`✓ ${label}`); };

  const document = (id, kind, status, productId, quantity, price, day='2026-10-14') => ({
    id, kind, status, partnerId: 'P1', date: day, note: '', invoiceNo: '',
    lines: [{ productId, quantity, unitPrice: price }],
  });
  const base = {
    docs: [
      document('B1', 'buy', 'Đã xác nhận', 'A', 10, 3000),
      document('B2', 'buy', 'Bản nháp', 'A', 100, 3000),
      document('S1', 'sell', 'Đã xác nhận', 'A', 3, 5000),
      document('S2', 'sell', 'Đã xác nhận', 'B', 5, 8000),
      document('S3', 'sell', 'Đã xác nhận', 'A', 12, 5000, '2026-09-12'),
    ],
    stockMovements: [
      { id: 'N1', kind: 'Nhập kho', status: 'confirmed', date: '2026-10-15', lines: [{ productId: 'A', quantity: 10 }] },
      { id: 'N2', kind: 'Nhập kho', status: 'draft', date: '2026-10-15', lines: [{ productId: 'A', quantity: 500 }] },
      { id: 'X1', kind: 'Xuất kho', status: 'confirmed', date: '2026-10-15', lines: [{ productId: 'A', quantity: 3 }, { productId: 'B', quantity: 5 }] },
      { id: 'X2', kind: 'Xuất kho', status: 'confirmed', date: '2026-09-15', lines: [{ productId: 'A', quantity: 12 }] },
    ],
  };

  check('chỉ tổng hợp chứng từ đã xác nhận', () => {
    const kpi = metrics.businessSummary(base, period);
    assert.deepEqual(kpi, { buyValue: 30000, sellValue: 55000, buyCount: 1, sellCount: 2 });
  });
  check('không phát sinh dữ liệu trong kỳ trả về 0', () => {
    assert.deepEqual(metrics.businessSummary(base, dec), { buyValue: 0, sellValue: 0, buyCount: 0, sellCount: 0 });
  });
  check('biểu đồ 12 tháng theo năm phân loại mua và bán', () => {
    const chart = metrics.monthlyBusinessTotals(base, 2026);
    assert.equal(chart.length, 12);
    assert.equal(chart[9].buy, 30000);
    assert.equal(chart[9].sell, 55000);
    assert.equal(chart[8].sell, 60000);
    assert.equal(chart[0].sell, 0);
  });
  check('top sản phẩm không tính chứng từ nháp và tuân theo ngày lọc', () => {
    assert.deepEqual(metrics.topProductsFromSalesDocs(base, period), [
      { productId: 'B', quantity: 5 }, { productId: 'A', quantity: 3 },
    ]);
  });
  check('thống kê nhập xuất chỉ theo phiếu xác nhận', () => {
    const movements = metrics.confirmedMovements(base, period);
    assert.equal(movements.length, 2);
    const flow = metrics.inventoryActivityByProduct(base, period);
    assert.deepEqual(flow.get('A'), { received: 10, issued: 3 });
    assert.deepEqual(flow.get('B'), { received: 0, issued: 5 });
  });
  check('lọc khác kỳ không lấy phiếu từ kỳ trước', () => {
    const flow = metrics.inventoryActivityByProduct(base, { ...none, mode: 'month', month: '2026-09' });
    assert.deepEqual(flow.get('A'), { received: 0, issued: 12 });
  });
  check('tính đúng nhiều dòng cùng mặt hàng và số thập phân', () => {
    const db = { ...base, docs: [
      { ...document('S4', 'sell', 'Đã xác nhận', 'B', 0.25, 100), lines: [
        { productId: 'B', quantity: 0.25, unitPrice: 100 },
        { productId: 'B', quantity: 0.75, unitPrice: 100 },
      ] },
    ] };
    assert.equal(metrics.businessSummary(db, none).sellValue, 100);
    assert.deepEqual(metrics.topProductsFromSalesDocs(db, none), [{ productId: 'B', quantity: 1 }]);
  });
  check('lọc ngày tuần tháng năm cùng logic dùng ở v0.6.4', () => {
    const on = '2026-10-14';
    assert(date.matchesDateFilter(on, { ...none, mode: 'day', day: on }));
    assert(date.matchesDateFilter(on, { ...none, mode: 'week', week: date.isoWeekFromDate(on) }));
    assert(date.matchesDateFilter(on, { ...none, mode: 'year', year: '2026' }));
    assert(!date.matchesDateFilter(on, dec));
  });
  console.log(`Đạt ${cases} kiểm thử báo cáo v0.7`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
