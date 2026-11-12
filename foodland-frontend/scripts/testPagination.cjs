const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

Module._extensions['.ts'] = function (mod, file) {
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, file);
};
const { paginateRecords, PAGE_SIZE } = require(path.resolve(__dirname, '../src/lib/pagination.ts'));
assert.equal(PAGE_SIZE, 10);
const sequence = Array.from({ length: 25 }, (_, index) => index + 1);
const verify = (source, page, expected, last) => {
  const result = paginateRecords(source, page);
  assert.deepEqual(result.items, expected);
  assert.equal(result.page, last);
  assert.ok(result.items.length <= PAGE_SIZE);
};
verify([], 1, [], 1);
verify(sequence.slice(0, 10), 1, sequence.slice(0, 10), 1);
verify(sequence.slice(0, 11), 2, [11], 2);
verify(sequence, 1, sequence.slice(0, 10), 1);
verify(sequence, 2, sequence.slice(10, 20), 2);
verify(sequence, 3, sequence.slice(20), 3);
verify(sequence, 99, sequence.slice(20), 3);
verify(sequence, -1, sequence.slice(0, 10), 1);
verify(sequence, 2.8, sequence.slice(10, 20), 2);
assert.equal(paginateRecords(sequence, 2).total, 25);
assert.equal(paginateRecords(sequence, 2).pages, 3);
assert.equal(paginateRecords(sequence, 2).startIndex, 10);
// Filter before paginate; export uses the full filtered array, not items.
const filtered = sequence.filter((x) => x % 2 === 0);
assert.equal(filtered.length, 12);
assert.equal(paginateRecords(filtered, 2).items.length, 2);
console.log('PASSED 12 pagination checks');
