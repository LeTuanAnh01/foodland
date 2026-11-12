import * as React from 'react';
import { Download, Plus } from 'lucide-react';
import { SearchInput, SectionCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useFoodland } from '@/data/store';
import type { Product } from '@/data/types';
import { downloadCsv } from '@/lib/utils';
import { ProductForm } from '../components/ProductForm';
import { ProductTable } from '../components/ProductTable';
import { productCategories, newProductTemplate } from '../data/productOptions';
export function ProductsPage(){const {db,saveProduct}=useFoodland();const [search,setSearch]=React.useState('');const [category,setCategory]=React.useState('all');const [editing,setEditing]=React.useState<Product|null>(null);const [oldId,setOldId]=React.useState<string|undefined>();
 const filtered=db.products.filter(p=>(p.name+' '+p.id+' '+p.spec).toLowerCase().includes(search.toLowerCase())&&(category==='all'||p.category===category));
 const partnerName=(id:string)=>db.partners.find(x=>x.id===id)?.name||'Chưa xác định';
 function open(p?:Product){setEditing(p?{...p}:{...newProductTemplate,id:'SP'+String(db.products.length+1).padStart(4,'0')});setOldId(p?.id)}
 return <>
 <SectionCard title="Danh sách hàng hóa" subtitle={`${db.products.length} mặt hàng trong danh mục · Không hiển thị tồn kho hoặc trạng thái`} right={<div className="flex flex-wrap items-center gap-2"><Button onClick={()=>open()}><Plus/> Thêm hàng hóa</Button><Button variant="outline" size="sm" onClick={()=>downloadCsv('foodland-hang-hoa.csv',['Mã hàng','Tên hàng','Nhóm','Đơn vị','Quy cách','Nguồn nhập','Giá tham khảo'],filtered.map(p=>[p.id,p.name,p.category,p.unit,p.spec,partnerName(p.supplierId),p.price]))}><Download/> Xuất CSV</Button></div>}>
 <div className="flex flex-wrap gap-3 border-b border-[#e9efe9] px-5 pb-4"><SearchInput placeholder="Tìm mã, tên hàng, quy cách..." value={search} onChange={setSearch}/><select className="field-select max-w-56" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Tất cả nhóm hàng</option>{productCategories.map(c=><option key={c}>{c}</option>)}</select></div>
 <ProductTable data={filtered} total={db.products.length} partners={db.partners} onEdit={open}/>
 </SectionCard>
 {editing&&<ProductForm value={editing} previousId={oldId} products={db.products} partners={db.partners} onChange={setEditing} onSave={saveProduct} onClose={()=>setEditing(null)}/>}
 </>;}
