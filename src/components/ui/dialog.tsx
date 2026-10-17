import * as React from 'react';
import { X } from 'lucide-react';
export function Modal({title,subtitle,onClose,children,footer,wide=false}:{title:string;subtitle?:string;onClose:()=>void;children:React.ReactNode;footer?:React.ReactNode;wide?:boolean}) {
  React.useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener)},[onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102b20]/45 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}} role="presentation">
    <section role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${wide?'max-w-[1050px]':'max-w-[680px]'}`}>
      <div className="flex shrink-0 items-start justify-between border-b border-[#e9eeea] p-5"><div><h2 className="text-xl font-bold text-[#152b20]">{title}</h2>{subtitle&&<p className="mt-1 text-xs text-[#85958b]">{subtitle}</p>}</div><button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 hover:bg-gray-100"><X size={18}/></button></div>
      <div className="overflow-auto p-5">{children}</div>{footer&&<div className="flex shrink-0 justify-end gap-2 border-t border-[#edf0ed] px-5 py-4">{footer}</div>}
    </section>
  </div>;
}
