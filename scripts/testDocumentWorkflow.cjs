const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const root = path.resolve(__dirname, '../src');
const ts = require('typescript');
const originalResolver = Module._resolveFilename;
const originalTsLoader = Module._extensions['.ts'];
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return originalResolver.call(this, request, parent, isMain, options);
};
Module._extensions['.ts'] = function (mod, filename) {
  const source = require('node:fs').readFileSync(filename, 'utf8');
  const js = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  mod._compile(js, filename);
};
const { initial } = require(path.join(root, 'data/mocks/initialData.ts'));
const { documentQuantities, validateBusinessDoc, validateLinkedMovement } = require(path.join(root, 'features/documents/utils/documentWorkflow.ts'));
const { getDocumentProgress } = require(path.join(root, 'features/documents/utils/documentProgress.ts'));
const { confirmMovementInDb } = require(path.join(root, 'features/inventory/utils/stockConfirmation.ts'));
const { migrateStockMovements, loadDemoData } = require(path.join(root, 'data/repositories/localStorageRepository.ts'));
const clone = x => structuredClone(x);
let passed = 0;
function run(name, fn) { fn(); passed++; console.log('PASS', name); }
const doc = { id:'NK00050',kind:'buy',partnerId:'NCC01',date:'2026-10-17',note:'',status:'Đã xác nhận',invoiceNo:'',lines:[{productId:'SP0001',quantity:100,unitPrice:9000},{productId:'SP0002',quantity:50,unitPrice:17000}] };
const movement = (id, sourceDocId, kind, lines, status='draft') => ({id,date:'2026-10-17',kind,status,sourceDocId,lines,note:''});
function db(){let x=clone(initial);x.docs.push(clone(doc));return x;}
run('Chứng từ hợp lệ',()=>{ assert.equal(validateBusinessDoc(db(),doc).ok,true); });
run('Chứng từ trùng hàng không duyệt',()=>{ const d={...doc,lines:[doc.lines[0],doc.lines[0]]};assert.equal(validateBusinessDoc(db(),d).ok,false); });
run('Không liên kết phiếu với chứng từ nháp',()=>{const x=db();x.docs.find(d=>d.id===doc.id).status='Bản nháp';assert.equal(validateLinkedMovement(x,movement('PN0100',doc.id,'Nhập kho',[{productId:'SP0001',quantity:10}])).ok,false);});
run('Không cho lập phiếu sai loại',()=>{assert.equal(validateLinkedMovement(db(),movement('PX0100',doc.id,'Xuất kho',[{productId:'SP0001',quantity:10}])).ok,false);});
run('Không cho lập phiếu vượt số lượng chứng từ',()=>{assert.equal(validateLinkedMovement(db(),movement('PN0100',doc.id,'Nhập kho',[{productId:'SP0001',quantity:101}])).ok,false);});
run('Một phiếu nháp giữ chỗ, phiếu khác chỉ lấy phần còn lại',()=>{let x=db();x.stockMovements.push(movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:60}]));const rows=documentQuantities(x,doc);assert.equal(rows.find(r=>r.productId==='SP0001').available,40);assert.equal(validateLinkedMovement(x,movement('PN0102',doc.id,'Nhập kho',[{productId:'SP0001',quantity:41}])).ok,false);assert.equal(validateLinkedMovement(x,movement('PN0102',doc.id,'Nhập kho',[{productId:'SP0001',quantity:40}])).ok,true);});
run('Sửa phiếu cũ không trừ giữ chỗ của chính nó',()=>{let x=db();x.stockMovements.push(movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:60}]));assert.equal(validateLinkedMovement(x,movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:100}]),'PN0101').ok,true);});
run('Xác nhận nhập 60 cập nhật kho đúng một lần',()=>{let x=db();x.stockMovements.push(movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:60}]));const before=x.stocks.find(s=>s.productId==='SP0001').quantity;const result=confirmMovementInDb(x,'PN0101');assert.equal(result.outcome.ok,true);assert.equal(result.db.stocks.find(s=>s.productId==='SP0001').quantity,before+60);assert.equal(result.db.stockMovements.find(s=>s.id==='PN0101').stockApplied,true);const again=confirmMovementInDb(result.db,'PN0101');assert.equal(again.outcome.ok,false);assert.equal(again.db.stocks.find(s=>s.productId==='SP0001').quantity,before+60);});
run('Nhập 2 đợt (60 + 40) và chặn đợt 3',()=>{let x=db();x.stockMovements.push(movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:60}]));let r=confirmMovementInDb(x,'PN0101');assert.equal(r.outcome.ok,true);x=r.db;x.stockMovements.push(movement('PN0102',doc.id,'Nhập kho',[{productId:'SP0001',quantity:40}]));r=confirmMovementInDb(x,'PN0102');assert.equal(r.outcome.ok,true);assert.equal(documentQuantities(r.db,doc).find(row=>row.productId==='SP0001').available,0);x=r.db;x.stockMovements.push(movement('PN0103',doc.id,'Nhập kho',[{productId:'SP0001',quantity:1}]));assert.equal(confirmMovementInDb(x,'PN0103').outcome.ok,false);});
run('Phiếu xuất thiếu hàng không trừ bất kỳ dòng nào',()=>{let x=db();const sell={...doc,id:'BH0100',kind:'sell',partnerId:'KH001'};x.docs.push(sell);x.stockMovements.push(movement('PX0100','BH0100','Xuất kho',[{productId:'SP0001',quantity:10},{productId:'SP0002',quantity:30}]));const original=clone(x.stocks);const result=confirmMovementInDb(x,'PX0100');assert.equal(result.outcome.ok,false);assert.deepEqual(result.db.stocks,original);});
run('Xuất đủ tồn thì giảm tồn, hóa đơn không liên quan',()=>{let x=db();const sell={...doc,id:'BH0100',kind:'sell',partnerId:'KH001'};x.docs.push(sell);x.stockMovements.push(movement('PX0100','BH0100','Xuất kho',[{productId:'SP0001',quantity:10},{productId:'SP0002',quantity:5}]));const result=confirmMovementInDb(x,'PX0100');assert.equal(result.outcome.ok,true);assert.equal(result.db.stocks.find(s=>s.productId==='SP0001').quantity,240);assert.equal(result.db.stocks.find(s=>s.productId==='SP0002').quantity,7);});
run('Chặn dòng hàng ngoài chứng từ',()=>{assert.equal(validateLinkedMovement(db(),movement('PN0100',doc.id,'Nhập kho',[{productId:'SP0005',quantity:5}])).ok,false);});
run('Phiếu không liên kết hoạt động như trước',()=>{const x=db();x.stockMovements.push(movement('PX0100',undefined,'Xuất kho',[{productId:'SP0001',quantity:5}]));assert.equal(confirmMovementInDb(x,'PX0100').outcome.ok,true);});
run('Migrate giữ sourceDocId của v0.6 và phiếu v0.4',()=>{const x=movement('PN0101',doc.id,'Nhập kho',[{productId:'SP0001',quantity:50}]);assert.equal(migrateStockMovements([x])[0].sourceDocId,doc.id);assert.deepEqual(migrateStockMovements([{id:'PX8888',kind:'Xuất kho',productId:'SP0001',qty:10,date:'2026-10-01',note:''}])[0].lines,[{productId:'SP0001',quantity:10}]);});
run('Migrating hóa đơn cũ giữ trạng thái xác nhận và không mất dữ liệu',()=>{const old=clone(initial);delete old.invoices[0].status;global.localStorage={getItem:(key)=>key==='foodland-react-prototype-v1'?JSON.stringify(old):null,setItem:()=>{}};const loaded=loadDemoData();assert.equal(loaded.invoices[0].status,'confirmed');assert.equal(loaded.products.length,old.products.length);assert.equal(loaded.stockMovements.length,old.stockMovements.length);});
run('v0.6.1 - Chưa xác nhận phiếu nào: trạng thái Chưa nhập', () => {
  const x = db();
  const p = getDocumentProgress(x, doc);
  assert.equal(p.status, 'none');
  assert.equal(p.label, 'Chưa nhập');
  assert.equal(p.remainingProductCount, 2);
});
run('v0.6.1 - Phiếu nháp không được tính đã nhập', () => {
  const x = db();
  x.stockMovements.push(movement('PN0101', doc.id, 'Nhập kho', [{productId: 'SP0001',quantity: 100},{productId:'SP0002',quantity:50}]));
  const p = getDocumentProgress(x, doc);
  assert.equal(p.status, 'none');
  assert.equal(p.pendingCount, 1);
  assert.equal(p.rows.find(row=>row.productId==='SP0001').remaining, 100);
});
run('v0.6.1 - Nhập một phần khi còn ít nhất một mặt hàng chưa đủ', () => {
  const x = db();
  x.stockMovements.push(movement('PN0101', doc.id, 'Nhập kho', [{productId:'SP0001',quantity:100}], 'confirmed'));
  const p = getDocumentProgress(x, doc);
  assert.equal(p.status, 'partial');
  assert.equal(p.remainingProductCount, 1);
  assert.equal(p.rows.find(row=>row.productId==='SP0002').remaining, 50);
});
run('v0.6.1 - Nhập đủ nhiều đợt đổi trạng thái khi đủ mọi mặt hàng', () => {
  const x = db();
  x.stockMovements.push(movement('PN0101', doc.id, 'Nhập kho', [{productId:'SP0001',quantity:60},{productId:'SP0002',quantity:50}], 'confirmed'));
  x.stockMovements.push(movement('PN0102', doc.id, 'Nhập kho', [{productId:'SP0001',quantity:40}], 'confirmed'));
  const p = getDocumentProgress(x, doc);
  assert.equal(p.status, 'complete');
  assert.equal(p.label, 'Đã nhập đủ');
  assert.equal(p.remainingProductCount, 0);
});
run('v0.6.1 - Xuất một phần và xuất đủ có nhãn độc lập trạng thái chứng từ', () => {
  const x = db();
  const sell = { ...doc, id: 'BH0105',kind:'sell',partnerId:'KH001',status:'Đã xác nhận' };
  x.docs.push(sell);
  x.stockMovements.push(movement('PX0105', sell.id, 'Xuất kho', [{productId:'SP0001',quantity:60},{productId:'SP0002',quantity:50}], 'confirmed'));
  assert.equal(getDocumentProgress(x, sell).label, 'Xuất một phần');
  x.stockMovements.push(movement('PX0106', sell.id, 'Xuất kho', [{productId:'SP0001',quantity:40}], 'confirmed'));
  assert.equal(getDocumentProgress(x, sell).label, 'Đã xuất đủ');
});
run('v0.6.1 - Phiếu của chứng từ khác không làm thay đổi tiến độ', () => {
  const x = db();
  x.stockMovements.push(movement('PN0999', 'NK00099', 'Nhập kho', [{productId:'SP0001',quantity:100}], 'confirmed'));
  assert.equal(getDocumentProgress(x, doc).status, 'none');
});
console.log(`PASSED ${passed} workflow checks`);
