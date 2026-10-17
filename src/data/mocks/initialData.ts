import type { DB } from '@/data/types';
export const initial: DB = {
 products:[
  {id:'SP0001',name:'Sữa tươi 180ml',category:'Đồ uống',unit:'Hộp',spec:'180 ml / hộp',supplierId:'NCC01',price:8000,note:'Sữa tiệt trùng'},
  {id:'SP0002',name:'Bánh quy bơ 200g',category:'Bánh kẹo',unit:'Gói',spec:'200 g / gói',supplierId:'NCC02',price:15000,note:''},
  {id:'SP0003',name:'Nước ép cam 1L',category:'Đồ uống',unit:'Chai',spec:'1 lít / chai',supplierId:'NCC01',price:28000,note:''},
  {id:'SP0004',name:'Mì ăn liền thùng 30 gói',category:'Thực phẩm khô',unit:'Thùng',spec:'30 gói / thùng',supplierId:'NCC02',price:150000,note:''},
  {id:'SP0005',name:'Thịt bò đông lạnh',category:'Thực phẩm tươi',unit:'Kg',spec:'Bảo quản đông lạnh',supplierId:'NCC03',price:250000,note:''},
  {id:'SP0006',name:'Rau cải xanh',category:'Thực phẩm tươi',unit:'Kg',spec:'Rau tươi',supplierId:'NCC03',price:18000,note:''},
  {id:'SP0007',name:'Gạo ST25 5kg',category:'Thực phẩm khô',unit:'Túi',spec:'5 kg / túi',supplierId:'NCC02',price:220000,note:''},
  {id:'SP0008',name:'Dầu ăn 1L',category:'Gia vị',unit:'Chai',spec:'1 lít / chai',supplierId:'NCC01',price:32000,note:''}
 ],
 stocks:[
  {productId:'SP0001',quantity:250,min:20,location:'Kho chính'},
  {productId:'SP0002',quantity:12,min:20,location:'Kho chính'},
  {productId:'SP0003',quantity:85,min:15,location:'Kho chính'},
  {productId:'SP0004',quantity:5,min:12,location:'Kho chính'},
  {productId:'SP0005',quantity:30,min:10,location:'Kho lạnh'},
  {productId:'SP0006',quantity:8,min:12,location:'Kho lạnh'},
  {productId:'SP0007',quantity:60,min:10,location:'Kho chính'},
  {productId:'SP0008',quantity:0,min:20,location:'Kho chính'}
 ],
 partners:[
  {id:'NCC01',name:'Công ty Thực phẩm An Phú',type:'supplier',phone:'024 3123 4567',address:'Hà Nội'},
  {id:'NCC02',name:'Công ty Minh Phát',type:'supplier',phone:'024 3999 1234',address:'Hà Nội'},
  {id:'NCC03',name:'Nông sản Việt Xanh',type:'supplier',phone:'024 3777 9999',address:'Hà Nội'},
  {id:'KH001',name:'Cửa hàng Bách Hóa Xanh',type:'customer',phone:'098 123 4567',address:'Hà Nội'},
  {id:'KH002',name:'Nhà hàng Biển Xanh',type:'customer',phone:'091 234 5678',address:'Hà Nội'},
  {id:'KH003',name:'Siêu thị An Phát',type:'customer',phone:'096 876 5432',address:'Hà Nội'}
 ],
 docs:[
  {id:'NK00001',kind:'buy',partnerId:'NCC01',date:'2026-10-10',note:'Nhập sữa',status:'Đã xác nhận',invoiceNo:'0000123',lines:[{productId:'SP0001',quantity:100,unitPrice:8000}]},
  {id:'NK00002',kind:'buy',partnerId:'NCC02',date:'2026-10-12',note:'Nhập bánh kẹo',status:'Bản nháp',invoiceNo:'',lines:[{productId:'SP0002',quantity:50,unitPrice:15000}]},
  {id:'NK00003',kind:'buy',partnerId:'NCC03',date:'2026-10-14',note:'Nhập rau',status:'Đã xác nhận',invoiceNo:'',lines:[{productId:'SP0006',quantity:120,unitPrice:18000}]},
  {id:'BH00001',kind:'sell',partnerId:'KH001',date:'2026-10-10',note:'Giao hàng đợt 1',status:'Đã xác nhận',invoiceNo:'0000210',lines:[{productId:'SP0001',quantity:30,unitPrice:12000}]},
  {id:'BH00002',kind:'sell',partnerId:'KH002',date:'2026-10-13',note:'Đơn hàng nhà hàng',status:'Bản nháp',invoiceNo:'',lines:[{productId:'SP0005',quantity:5,unitPrice:290000}]},
  {id:'BH00003',kind:'sell',partnerId:'KH003',date:'2026-10-14',note:'Đơn hàng tháng 10',status:'Đã xác nhận',invoiceNo:'',lines:[{productId:'SP0003',quantity:24,unitPrice:38000}]}
 ],
 stockMovements: [
  {
    id: 'PN0001', date: '2026-10-14', kind: 'Nhập kho', status: 'draft',
    note: 'Phiếu nhập mẫu', lines: [{ productId: 'SP0001', quantity: 100 }],
  },
  {
    id: 'PX0001', date: '2026-10-13', kind: 'Xuất kho', status: 'draft',
    note: 'Phiếu xuất mẫu', lines: [{ productId: 'SP0002', quantity: 15 }],
  },
  {
    id: 'PN0002', date: '2026-10-12', kind: 'Nhập kho', status: 'draft',
    note: 'Phiếu nhập mẫu', lines: [{ productId: 'SP0006', quantity: 45 }],
  },
  {
    id: 'PX0002', date: '2026-10-10', kind: 'Xuất kho', status: 'draft',
    note: 'Phiếu xuất mẫu', lines: [{ productId: 'SP0003', quantity: 20 }],
  },
 ],
 stockChecks:[
  {id:'KK0001',date:'2026-10-10',status:'Bản nháp',note:'Đối chiếu hàng mẫu tại kho chính'}
 ],
 invoices:[
  {id:'HD0001',kind:'buy',docId:'NK00001',number:'0000123',symbol:'C25TAA',date:'2026-10-12',note:'Hóa đơn đầu vào mẫu',status:'confirmed'},
  {id:'HD0002',kind:'sell',docId:'BH00001',number:'0000210',symbol:'C25TAA',date:'2026-10-11',note:'Hóa đơn đầu ra mẫu',status:'confirmed'}
 ]
};
