import { Pencil } from 'lucide-react';
import { EmptyState, TableFooter, TableScroll, usePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/utils';
import type { Partner, Product } from '@/data/types';
type Props={data:Product[];total:number;partners:Partner[];onEdit:(product:Product)=>void};
export function ProductTable({data,partners,onEdit}:Props){const partnerName=(id:string)=>partners.find(p=>p.id===id)?.name||'Chưa xác định';const pagination=usePagination(data);return <>
 <TableScroll><table className="data-table"><thead><tr>{['MÃ HÀNG','TÊN HÀNG','NHÓM HÀNG','ĐƠN VỊ','QUY CÁCH','NGUỒN NHẬP','GIÁ THAM KHẢO','THAO TÁC'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{pagination.items.map(p=><tr key={p.id}><td className="font-bold text-[#13845c]">{p.id}</td><td className="font-semibold !text-[#213a2a]">{p.name}</td><td>{p.category}</td><td>{p.unit}</td><td>{p.spec||'—'}</td><td>{partnerName(p.supplierId)}</td><td>{money(p.price)}</td><td><Button aria-label={`Sửa ${p.name}`} variant="ghost" size="icon" onClick={()=>onEdit(p)}><Pencil size={15}/></Button></td></tr>)}</tbody></table>{!data.length&&<EmptyState/>}</TableScroll>
 <TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage}/>
 </>;}
