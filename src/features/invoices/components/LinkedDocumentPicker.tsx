import * as React from 'react';
import { FileText } from 'lucide-react';
import { EmptyState, SearchInput, TableScroll, TableFooter, usePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import type { BusinessDoc, DocKind } from '@/data/types';
import { subtotal } from '@/data/store';
import { dateVN, money } from '@/lib/utils';
export function LinkedDocumentPicker({kind,docs,onPick,partnerName}:{kind:DocKind;docs:BusinessDoc[];onPick:(doc:BusinessDoc)=>void;partnerName:(id:string)=>string}){
 const [query,setQuery]=React.useState('');const filtered=docs.filter(d=>(d.id+' '+partnerName(d.partnerId)+' '+d.note).toLowerCase().includes(query.toLowerCase()));
 const pagination=usePagination(filtered,[query]);
 return <div><p className="mb-4 text-xs text-[#7c9082]">Chọn chứng từ {kind==='buy'?'mua':'bán'} đã xác nhận và chưa có hóa đơn. Thông tin đầy đủ giúp kế toán dễ đối chiếu.</p>
 <div className="mb-4"><SearchInput placeholder="Tìm theo số chứng từ, đối tác, nội dung..." value={query} onChange={setQuery} className="max-w-none"/></div>
 <div className="max-h-[370px] overflow-auto rounded-xl border border-[#e8eee8]"><TableScroll><table className="data-table"><thead><tr><th>NGÀY</th><th>CHỨNG TỪ</th><th>ĐỐI TÁC</th><th>DIỄN GIẢI</th><th>GIÁ TRỊ</th><th></th></tr></thead><tbody>{pagination.items.map(d=><tr key={d.id}><td>{dateVN(d.date)}</td><td className="font-bold text-emerald-700">{d.id}</td><td>{partnerName(d.partnerId)}</td><td>{d.note||'—'}</td><td>{money(subtotal(d))}</td><td><Button size="sm" onClick={()=>onPick(d)}><FileText/> Chọn</Button></td></tr>)}</tbody></table>{!filtered.length&&<EmptyState text="Không còn chứng từ chưa có hóa đơn phù hợp"/>}</TableScroll></div><TableFooter total={pagination.total} page={pagination.page} onPageChange={pagination.setPage}/>
 </div>
}
