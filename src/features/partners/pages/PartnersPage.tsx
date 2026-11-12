import * as React from 'react';
import { Plus } from 'lucide-react';
import { SearchInput, SectionCard, Tabs } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useFoodland } from '@/data/store';
import type { Partner } from '@/data/types';
import { PartnerForm } from '../components/PartnerForm';
import { PartnerTable } from '../components/PartnerTable';
export function PartnersPage(){const {db,savePartner}=useFoodland();const [tab,setTab]=React.useState('all');const [query,setQuery]=React.useState('');const [draft,setDraft]=React.useState<Partner|null>(null);
 const partners=db.partners.filter(p=>(tab==='all'||p.type===tab)&&(p.name+' '+p.id+' '+p.phone).toLowerCase().includes(query.toLowerCase()));
 const add=()=>setDraft({id:'DT'+String(db.partners.length+1).padStart(3,'0'),name:'',type:'supplier',phone:'',address:''});
 return <>
 <SectionCard title="Danh sách đối tác" subtitle="Quản lý dữ liệu demo để thử biểu mẫu mua và bán" right={<Button onClick={add}><Plus/> Thêm đối tác</Button>}><Tabs active={tab} onChange={setTab} items={[{id:'all',label:'Tất cả'},{id:'supplier',label:'Nhà cung cấp'},{id:'customer',label:'Khách hàng'}]}/><div className="mx-5 my-4"><SearchInput value={query} onChange={setQuery} placeholder="Tìm tên, mã hoặc số điện thoại..."/></div><PartnerTable partners={partners} total={db.partners.length}/></SectionCard>
 {draft&&<PartnerForm draft={draft} onChange={setDraft} onSave={savePartner} onClose={()=>setDraft(null)} partners={db.partners}/>}
 </>;
}
