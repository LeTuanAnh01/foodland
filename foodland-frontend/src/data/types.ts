export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  spec: string;
  supplierId: string;
  price: number;
  note: string;
};

export type Stock = {
  productId: string;
  quantity: number;
  min: number;
  location: string;
};

export type Partner = {
  id: string;
  name: string;
  type: 'supplier' | 'customer';
  phone: string;
  address: string;
};

export type Line = { productId: string; quantity: number; unitPrice: number };
export type DocKind = 'buy' | 'sell';

export type BusinessDoc = {
  id: string;
  kind: DocKind;
  partnerId: string;
  date: string;
  note: string;
  status: 'Bản nháp' | 'Đã xác nhận';
  invoiceNo: string;
  lines: Line[];
};

export type Invoice = {
  id: string;
  kind: DocKind;
  docId: string;
  number: string;
  symbol: string;
  date: string;
  note: string;
  status: 'draft' | 'confirmed';
};

// Phiếu kho là biểu mẫu độc lập với chứng từ mua/bán.
// Lưu bản nháp không đổi tồn. Xác nhận thành công mới cộng/trừ tồn.
export type StockMovementKind = 'Nhập kho' | 'Xuất kho';

// Kiểu phiếu cũ (v0.4), chỉ dùng để migrate dữ liệu localStorage.
export type StockMovement = {
  id: string;
  date: string;
  kind: StockMovementKind;
  productId: string;
  qty: number;
  note: string;
};

// Một phiếu có nhiều dòng hàng, không gộp số lượng khác đơn vị.
export type StockMovementLine = {
  productId: string;
  quantity: number;
};

export type StockMovementV2 = {
  id: string;
  date: string;
  kind: StockMovementKind;
  status: 'draft' | 'confirmed';
  // Chỉ phiếu xác nhận kể từ v0.5.2 mới có dấu này.
  stockApplied?: boolean;
  // Liên kết chứng từ mua/bán. Phiếu trực tiếp tại kho không có trường này.
  sourceDocId?: string;
  note: string;
  lines: StockMovementLine[];
};

export type StockCheck = {
  id: string;
  date: string;
  status: 'Bản nháp';
  note: string;
};

export type DB = {
  products: Product[];
  stocks: Stock[];
  partners: Partner[];
  docs: BusinessDoc[];
  invoices: Invoice[];
  stockMovements: StockMovementV2[];
  stockChecks: StockCheck[];
};
