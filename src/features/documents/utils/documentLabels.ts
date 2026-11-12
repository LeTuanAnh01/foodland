import type { DocKind } from '@/data/types';
export const documentVerb=(kind:DocKind)=>kind==='buy'?'mua':'bán';
export const invoiceTitle=(kind:DocKind)=>kind==='buy'?'Nhận hóa đơn đầu vào':'Thêm hóa đơn bán hàng';
