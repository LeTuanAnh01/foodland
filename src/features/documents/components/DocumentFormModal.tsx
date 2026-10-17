import * as React from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { subtotal, useFoodland } from '@/data/store';
import type { BusinessDoc, DocKind, Line } from '@/data/types';
import { money } from '@/lib/utils';
import { DocumentItemsEditor } from './DocumentItemsEditor';
import { localToday } from '@/features/inventory/utils/movementIds';
import { documentVerb } from '../utils/documentLabels';
const initialLine:Line={productId:'',quantity:1,unitPrice:0};
export function DocumentFormModal({kind,onClose,onSaved,document}:{kind:DocKind;onClose:()=>void;onSaved:()=>void;document?:BusinessDoc}){
 const {db,saveDoc}=useFoodland();
 const [error,setError]=React.useState('');
 const prefix=kind==='buy'?'NK':'BH';
 const nextCode=db.docs.reduce((max,doc)=>{const match=doc.id.match(new RegExp(`^${prefix}(\\d+)$`));return match?Math.max(max,Number(match[1])):max},0)+1;
 const [draft,setDraft]=React.useState<BusinessDoc>(()=>document
   ? {...document,lines:document.lines.map(line=>({...line}))}
   : {id:prefix+String(nextCode).padStart(5,'0'),kind,partnerId:'',date:localToday(),note:'',status:'Bản nháp',invoiceNo:'',lines:[{...initialLine}]});
 const update=(patch:Partial<BusinessDoc>)=>{setDraft(previous=>({...previous,...patch}));setError('')};
 function submit(e:React.FormEvent){
   e.preventDefault();
   const id=draft.id.trim().toUpperCase();
   if(!id){setError('Chưa nhập mã chứng từ.');return}
   if(!document&&db.docs.some(d=>d.id===id)){setError('Mã chứng từ đã tồn tại.');return}
   const result=saveDoc({...draft,id},document?.id);
   if(!result.ok){setError(result.message);return}
   onSaved();
 }
 return <Modal wide title={`${document?'Sửa':'Thêm'} chứng từ ${documentVerb(kind)}`} subtitle="Lưu bản nháp không cập nhật kho. Chứng từ phải được xác nhận riêng." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" form="document-form">Lưu bản nháp</Button></>}>
 <form onSubmit={submit} id="document-form">
 <div className="mb-5 grid gap-4 md:grid-cols-4">
 <FormField label={kind==='buy'?'Nhà cung cấp *':'Khách hàng *'}><select className="field-select" required value={draft.partnerId} onChange={e=>update({partnerId:e.target.value})}><option value="">Chọn đối tác</option>{db.partners.filter(p=>p.type===(kind==='buy'?'supplier':'customer')).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
 <FormField label="Ngày chứng từ"><Input type="date" value={draft.date} onChange={e=>update({date:e.target.value})}/></FormField>
 <FormField label="Số chứng từ"><Input value={draft.id} readOnly={Boolean(document)} onChange={e=>update({id:e.target.value})}/></FormField>
 <FormField label="Trạng thái demo"><Input value="Bản nháp" disabled/></FormField>
 <div className="md:col-span-4"><FormField label="Ghi chú"><Input value={draft.note} onChange={e=>update({note:e.target.value})}/></FormField></div>
 </div>
 <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Hàng hóa trên chứng từ</h3><Button type="button" size="sm" variant="outline" onClick={()=>update({lines:[...draft.lines,{...initialLine}]})}><Plus/> Thêm dòng</Button></div>
 <DocumentItemsEditor lines={draft.lines} products={db.products} onChange={lines=>update({lines})}/>
 <div className="mt-5 flex justify-end rounded-xl bg-[#eef8f1] px-5 py-4"><span className="mr-6 text-sm text-[#577364]">Tổng giá trị mẫu</span><strong className="text-lg text-[#107b54]">{money(subtotal(draft))}</strong></div>
 {error&&<p role="alert" className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
 </form>
 </Modal>
}
