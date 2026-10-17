import { Pencil } from 'lucide-react';
import { EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, Stock } from '@/data/types';
import { stockStatus } from '../utils/stockStatus';
export function StockTable({stocks,products,onEdit}:{stocks:Stock[];allCount:number;products:Product[];onEdit:(stock:Stock)=>void}){const pagination=usePagination(stocks);return <>
 <TableScroll><table className="data-table"><thead><tr>{['MÃ HÀNG','TÊN HÀNG','ĐVT','KHO','SỐ TỒN','CẢNH BÁO DƯỚI','TRẠNG THÁI','THAO TÁC'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{pagination.items.map(s=>{const p=products.find(x=>x.id===s.productId);const status=stockStatus(s);return <tr key={s.productId}><td className="font-bold text-[#13845c]">{s.productId}</td><td className="font-semibold !text-[#213a2a]">{p?.name}</td><td>{p?.unit}</td><td>{s.location}</td><td className="!font-bold">{s.quantity}</td><td>{s.min}</td><td><Badge tone={status.tone}>{status.text}</Badge></td><td><Button variant="ghost" size="icon" title="Chỉnh số tồn mẫu" onClick={()=>onEdit({...s})}><Pencil size={15}/></Button></td></tr>})}</tbody></table>{!stocks.length&&<EmptyState/>}</TableScroll>
 <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage}/>
 </>;}
