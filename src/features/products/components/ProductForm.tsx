import * as React from 'react';
import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Partner, Product } from '@/data/types';
import { productCategories, productUnits } from '../data/productOptions';

type Props={value:Product; previousId?:string; products:Product[]; partners:Partner[];onChange:(value:Product)=>void;onSave:(value:Product,previousId?:string)=>void;onClose:()=>void};
export function ProductForm({value,previousId,products,partners,onChange,onSave,onClose}:Props){
 const set=(patch:Partial<Product>)=>onChange({...value,...patch});
 function submit(e:React.FormEvent){e.preventDefault();if(!value.id.trim()||!value.name.trim())return;if(products.some(x=>x.id===value.id&&x.id!==previousId)){alert('Mã hàng đã tồn tại');return}onSave(value,previousId);onClose()}
 return <Modal title={previousId?'Chỉnh sửa hàng hóa':'Thêm hàng hóa'} subtitle="Chỉ sửa thông tin danh mục; tồn kho được quản lý tại trang Kho" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" form="product-form">Lưu hàng hóa</Button></>}>
 <form onSubmit={submit} id="product-form" className="grid gap-4 sm:grid-cols-2">
 <FormField label="Mã hàng *"><Input required value={value.id} onChange={e=>set({id:e.target.value})}/></FormField>
 <FormField label="Tên hàng hóa *"><Input required value={value.name} onChange={e=>set({name:e.target.value})}/></FormField>
 <FormField label="Nhóm hàng"><select className="field-select" value={value.category} onChange={e=>set({category:e.target.value})}>{productCategories.map(c=><option key={c}>{c}</option>)}</select></FormField>
 <FormField label="Đơn vị tính"><select className="field-select" value={value.unit} onChange={e=>set({unit:e.target.value})}>{productUnits.map(u=><option key={u}>{u}</option>)}</select></FormField>
 <FormField label="Quy cách / thông số"><Input value={value.spec} onChange={e=>set({spec:e.target.value})} placeholder="Ví dụ: 48 hộp/thùng"/></FormField>
 <FormField label="Giá tham khảo (đ)"><Input min={0} type="number" value={value.price} onChange={e=>set({price:Number(e.target.value)})}/></FormField>
 <FormField label="Nguồn nhập / nhà cung cấp"><select className="field-select" value={value.supplierId} onChange={e=>set({supplierId:e.target.value})}><option value="">Chưa chọn</option>{partners.filter(p=>p.type==='supplier').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
 <FormField label="Ghi chú"><Input value={value.note} onChange={e=>set({note:e.target.value})}/></FormField>
 </form></Modal>
}
