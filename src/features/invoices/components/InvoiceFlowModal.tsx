import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { useFoodland } from '@/data/store';
import type { BusinessDoc, DocKind, Invoice } from '@/data/types';
import { localToday } from '@/features/inventory/utils/movementIds';
import { invoiceTitle } from '@/features/documents/utils/documentLabels';
import { LinkedDocumentPicker } from './LinkedDocumentPicker';
import { InvoiceForm } from './InvoiceForm';
export function InvoiceFlowModal({kind,onClose,onSaved}:{kind:DocKind;onClose:()=>void;onSaved:()=>void}){
 const {db,saveInvoice}=useFoodland();const [phase,setPhase]=React.useState<'pick'|'edit'>('pick');const [invoice,setInvoice]=React.useState<Invoice|null>(null);const [error,setError]=React.useState('');
 const partnerName=(id:string)=>db.partners.find(p=>p.id===id)?.name||'—';
 function selectDocument(doc:BusinessDoc){
  const nextId=db.invoices.reduce((max,item)=>{const match=item.id.match(/^HD(\d+)$/);return match?Math.max(max,Number(match[1])):max},0)+1;
  setInvoice({id:`HD${String(nextId).padStart(4,'0')}`,kind,docId:doc.id,number:'',symbol:'',date:localToday(),note:'',status:'draft'});
  setError('');setPhase('edit');
}
 function submit(e:React.FormEvent){
  e.preventDefault();if(!invoice||!invoice.number.trim()){setError('Vui lòng nhập số hóa đơn.');return}
  const result=saveInvoice(invoice);
  if(!result.ok){setError(result.message);return}
  onSaved();
}
 const selectedDocument=db.docs.find(d=>d.id===invoice?.docId);
 return <Modal wide title={invoiceTitle(kind)} subtitle="Dùng cùng một mẫu form cho hóa đơn mua và bán" onClose={onClose} footer={phase==='edit'?<><Button variant="outline" onClick={()=>setPhase('pick')}>Đổi chứng từ</Button><Button type="submit" form="invoice-form">Lưu hóa đơn nháp</Button></>:<Button variant="outline" onClick={onClose}>Đóng</Button>}>
 {phase==='pick'?<LinkedDocumentPicker kind={kind} docs={db.docs.filter(d=>d.kind===kind&&d.status==='Đã xác nhận'&&!db.invoices.some(i=>i.docId===d.id)&&!d.invoiceNo)} onPick={selectDocument} partnerName={partnerName}/>:invoice&&selectedDocument&&<InvoiceForm invoice={invoice} document={selectedDocument} partnerName={partnerName(selectedDocument.partnerId)} onChange={setInvoice} onSave={submit}/>}
 {error&&<p role="alert" className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
 </Modal>
}
