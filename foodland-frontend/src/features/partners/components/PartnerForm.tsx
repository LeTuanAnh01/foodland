import * as React from 'react';
import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Partner } from '@/data/types';
export function PartnerForm({draft,onChange,onSave,onClose,partners}:{draft:Partner;onChange:(p:Partner)=>void;onSave:(p:Partner)=>void;onClose:()=>void;partners:Partner[]}){
 const set=(patch:Partial<Partner>)=>onChange({...draft,...patch});
 function submit(e:React.FormEvent){e.preventDefault();if(partners.some(p=>p.id===draft.id)){alert('Mã đối tác đã tồn tại');return}onSave(draft);onClose()}
 return <Modal title="Thêm đối tác" subtitle="Dữ liệu chỉ lưu cục bộ trong trình duyệt" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" form="partner-form">Lưu đối tác</Button></>}>
 <form id="partner-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
 <FormField label="Mã đối tác *"><Input required value={draft.id} onChange={e=>set({id:e.target.value})}/></FormField>
 <FormField label="Tên đối tác *"><Input required value={draft.name} onChange={e=>set({name:e.target.value})}/></FormField>
 <FormField label="Loại đối tác"><select className="field-select" value={draft.type} onChange={e=>set({type:e.target.value as Partner['type']})}><option value="supplier">Nhà cung cấp</option><option value="customer">Khách hàng</option></select></FormField>
 <FormField label="Số điện thoại"><Input value={draft.phone} onChange={e=>set({phone:e.target.value})}/></FormField>
 <div className="sm:col-span-2"><FormField label="Địa chỉ"><Input value={draft.address} onChange={e=>set({address:e.target.value})}/></FormField></div>
 </form></Modal>
}
