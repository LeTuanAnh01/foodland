import type { Stock } from '@/data/types';
export const stockStatus=(s:Stock)=>s.quantity<=0?{text:'Hết hàng',tone:'red' as const}:s.quantity<=s.min?{text:'Sắp hết',tone:'orange' as const}:{text:'Còn hàng',tone:'green' as const};
