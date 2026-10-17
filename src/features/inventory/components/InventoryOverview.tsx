import * as React from 'react';
import { AlertTriangle, Download, Package, Warehouse } from 'lucide-react';
import { MetricCard, SearchInput } from '@/components/shared';
import { Button } from '@/components/ui/button';
import type { Product, Stock } from '@/data/types';
import { compact, downloadCsv } from '@/lib/utils';
import { StockTable } from './StockTable';
export function InventoryOverview({stocks,products,onEdit}:{stocks:Stock[];products:Product[];onEdit:(s:Stock)=>void}){const [search,setSearch]=React.useState('');
 const filtered=stocks.filter(s=>{const p=products.find(p=>p.id===s.productId);return(p?.name+' '+p?.id+' '+s.location).toLowerCase().includes(search.toLowerCase())});
 const warning=stocks.filter(s=>s.quantity>0&&s.quantity<=s.min).length;const out=stocks.filter(s=>s.quantity<=0).length;
 return <><div className="grid gap-3 p-5 sm:grid-cols-3"><MetricCard label="Số mặt hàng" value={compact(stocks.length)} icon={<Package size={19}/>}/><MetricCard label="Mặt hàng sắp hết" value={String(warning)} icon={<AlertTriangle size={19}/>} tone="orange"/><MetricCard label="Mặt hàng hết hàng" value={String(out)} icon={<Warehouse size={19}/>} tone="blue"/></div>
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9efe9] px-5 pb-4"><SearchInput value={search} onChange={setSearch} placeholder="Tìm hàng tồn theo tên, mã..." className="max-w-[350px]"/><Button variant="outline" size="sm" onClick={()=>downloadCsv('foodland-ton-kho.csv',['Mã hàng','Tên hàng','Đơn vị','Kho','Số tồn','Ngưỡng cảnh báo'],filtered.map(s=>{const p=products.find(p=>p.id===s.productId);return[s.productId,p?.name||'',p?.unit||'',s.location,s.quantity,s.min]}))}><Download/> Xuất CSV</Button></div>
 <StockTable key={search} stocks={filtered} allCount={stocks.length} products={products} onEdit={onEdit}/>
 </>;}
