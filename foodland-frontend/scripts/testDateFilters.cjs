const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const source = path.resolve(__dirname, '../src/lib/dateFilter.ts');
Module._extensions['.ts'] = function (mod, file) {
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, file);
};
const { isoWeekStart, isoWeekFromDate, matchesDateFilter, EMPTY_DATE_FILTER, localDateValue } = require(source);
let passed = 0;
const check = (name, fn) => { fn(); passed++; console.log(`PASS ${name}`); };
const filter = (mode, key, value) => ({ ...EMPTY_DATE_FILTER, mode, [key]: value });
check('Tất cả thời gian không lọc', () => {
  assert.equal(matchesDateFilter('2026-01-01', EMPTY_DATE_FILTER), true);
});
check('Ngày cụ thể', () => {
  assert.equal(matchesDateFilter('2026-10-17', filter('day', 'day', '2026-10-17')), true);
  assert.equal(matchesDateFilter('2026-10-18', filter('day', 'day', '2026-10-17')), false);
});
check('Khoảng ngày tính cả hai ngày đầu và cuối', () => {
  const f = { ...EMPTY_DATE_FILTER, mode: 'range', from: '2026-10-12', to: '2026-10-17' };
  assert.equal(matchesDateFilter('2026-10-12', f), true);
  assert.equal(matchesDateFilter('2026-10-17', f), true);
  assert.equal(matchesDateFilter('2026-10-18', f), false);
  assert.equal(matchesDateFilter('2026-10-11', f), false);
});
check('Khoảng ngày một đầu mốc và khoảng ngày ngược', () => {
  assert.equal(matchesDateFilter('2026-10-10', { ...EMPTY_DATE_FILTER, mode: 'range', to: '2026-10-12' }), true);
  assert.equal(matchesDateFilter('2026-10-13', { ...EMPTY_DATE_FILTER, mode: 'range', to: '2026-10-12' }), false);
  assert.equal(matchesDateFilter('2026-10-15', { ...EMPTY_DATE_FILTER, mode: 'range', from: '2026-10-16' }), false);
  assert.equal(matchesDateFilter('2026-10-15', { ...EMPTY_DATE_FILTER, mode: 'range', from: '2026-10-16', to: '2026-10-10' }), false);
});
check('Tuần ISO bắt đầu thứ Hai và kết thúc Chủ nhật', () => {
  assert.equal(isoWeekFromDate('2026-10-12'), '2026-W42');
  assert.equal(isoWeekFromDate('2026-10-18'), '2026-W42');
  assert.equal(isoWeekFromDate('2026-10-19'), '2026-W43');
  assert.equal(matchesDateFilter('2026-10-18', filter('week', 'week', '2026-W42')), true);
  assert.equal(matchesDateFilter('2026-10-19', filter('week', 'week', '2026-W42')), false);
});
check('Tuần ISO qua ranh giới năm', () => {
  assert.equal(isoWeekFromDate('2020-12-31'), '2020-W53');
  assert.equal(isoWeekFromDate('2021-01-01'), '2020-W53');
  assert.equal(isoWeekFromDate('2021-01-04'), '2021-W01');
  assert.equal(isoWeekStart('2020-W53'), '2020-12-28');
  assert.equal(isoWeekStart('2021-W53'), null);
});
check('Tháng và năm cụ thể', () => {
  assert.equal(matchesDateFilter('2026-10-01', filter('month', 'month', '2026-10')), true);
  assert.equal(matchesDateFilter('2026-11-01', filter('month', 'month', '2026-10')), false);
  assert.equal(matchesDateFilter('2026-12-31', filter('year', 'year', '2026')), true);
  assert.equal(matchesDateFilter('2027-01-01', filter('year', 'year', '2026')), false);
});
check('Ngày địa phương không đổi do UTC', () => {
  assert.equal(localDateValue(new Date(2026, 9, 17)), '2026-10-17');
});
console.log(`PASSED ${passed} date-filter checks`);
