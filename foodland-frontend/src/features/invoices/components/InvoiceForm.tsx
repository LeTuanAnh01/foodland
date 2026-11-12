import * as React from 'react';
import { Link2 } from 'lucide-react';
import { FormField } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { subtotal } from '@/data/store';
import type { BusinessDoc, Invoice } from '@/data/types';
import { money } from '@/lib/utils';
export function InvoiceForm({invoice,document,partnerName,onChange,onSave}:{invoice:Invoice;document:BusinessDoc;partnerName:string;onChange:(invoice:Invoice)=>void;onSave:(e:React.FormEvent)=>void}){
 const update=(patch:Partial<Invoice>)=>onChange({...invoice,...patch});
 return <form onSubmit={onSave} id="invoice-form"><div className="mb-5 rounded-xl border border-[#daeee0] bg-[#f3faf5] p-4"><div className="mb-1 flex items-center gap-2 text-sm font-bold text-[#127b53]"><Link2 size={16}/> Chứng từ liên kết: {document.id}</div><p className="text-xs text-[#789280]">{partnerName} · {money(subtotal(document))}</p></div>
 <div className="grid gap-4 sm:grid-cols-2">
 <FormField label="Số hóa đơn *"><Input required value={invoice.number} onChange={e=>update({number:e.target.value})}/></FormField>
 <FormField label="Ký hiệu hóa đơn"><Input value={invoice.symbol} onChange={e=>update({symbol:e.target.value})}/></FormField>
 <FormField label="Ngày hóa đơn"><Input type="date" value={invoice.date} onChange={e=>update({date:e.target.value})}/></FormField>
 <FormField label="Đối tác"><Input disabled value={partnerName}/></FormField>
 <div className="sm:col-span-2"><FormField label="Ghi chú"><Input value={invoice.note} onChange={e=>update({note:e.target.value})}/></FormField></div>
 </div><p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Thông tin hóa đơn trong bản demo chỉ được ghi nhận cục bộ để duyệt UI, không phát hành hóa đơn điện tử hoặc xử lý thuế.</p>
 </form>;}
