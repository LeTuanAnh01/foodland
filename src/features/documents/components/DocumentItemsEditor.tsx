import { Trash2 } from 'lucide-react';
import { TableScroll, TableFooter, usePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Line, Product } from '@/data/types';
import { money } from '@/lib/utils';
type Props={lines:Line[];products:Product[];onChange:(lines:Line[])=>void};
export function DocumentItemsEditor({lines,products,onChange}:Props){
 const pagination=usePagination(lines, [], {followAppend:true});
 const update=(index:number,patch:Partial<Line>)=>onChange(lines.map((line,i)=>i===index?{...line,...patch}:line));
 return <><TableScroll><table className="data-table"><thead><tr><th>HÀNG HÓA *</th><th>SỐ LƯỢNG *</th><th>ĐƠN GIÁ MẪU *</th><th>THÀNH TIỀN</th><th></th></tr></thead><tbody>{pagination.items.map((line,rowIndex)=>{const index=pagination.startIndex+rowIndex;return <tr key={index}>
 <td><select required className="field-select min-w-[230px]" value={line.productId} onChange={e=>update(index,{productId:e.target.value,unitPrice:products.find(p=>p.id===e.target.value)?.price||0})}><option value="">Chọn hàng hóa</option>{products.map(p=><option value={p.id} key={p.id}>{p.id} – {p.name}</option>)}</select></td>
 <td><Input required type="number" min={1} className="w-24" value={line.quantity} onChange={e=>update(index,{quantity:Number(e.target.value)})}/></td>
 <td><Input required type="number" min={0} className="w-36" value={line.unitPrice} onChange={e=>update(index,{unitPrice:Number(e.target.value)})}/></td>
 <td className="!font-bold">{money(line.quantity*line.unitPrice)}</td>
 <td><Button type="button" variant="ghost" size="icon" aria-label={`Xóa dòng ${index+1}`} disabled={lines.length===1} onClick={()=>onChange(lines.filter((_,i)=>i!==index))}><Trash2 size={15}/></Button></td>
 </tr>})}</tbody></table></TableScroll><TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage}/></>
}
