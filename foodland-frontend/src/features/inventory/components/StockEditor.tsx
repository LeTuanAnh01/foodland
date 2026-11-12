import { FormField } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/dialog';
import type { Stock } from '@/data/types';
export function StockEditor({stock,name,onChange,onSave,onClose}:{stock:Stock;name?:string;onChange:(s:Stock)=>void;onSave:(s:Stock)=>void;onClose:()=>void}){return <Modal title="Chỉnh số tồn mẫu" subtitle="Điều chỉnh trực tiếp số tồn demo; không tạo phiếu kho. Chỉ sử dụng khi thử nghiệm." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" form="stock-form">Lưu thay đổi</Button></>}>
 <form id="stock-form" onSubmit={e=>{e.preventDefault();onSave(stock);onClose()}} className="grid gap-4 sm:grid-cols-2"><div className="col-span-full rounded-lg bg-[#f4f8f5] p-3 text-sm">{name}</div>
 <FormField label="Số tồn"><Input type="number" min={0} value={stock.quantity} onChange={e=>onChange({...stock,quantity:Number(e.target.value)})}/></FormField>
 <FormField label="Ngưỡng cảnh báo"><Input type="number" min={0} value={stock.min} onChange={e=>onChange({...stock,min:Number(e.target.value)})}/></FormField>
 <FormField label="Tên kho"><Input value={stock.location} onChange={e=>onChange({...stock,location:e.target.value})}/></FormField></form>
 </Modal>;}
