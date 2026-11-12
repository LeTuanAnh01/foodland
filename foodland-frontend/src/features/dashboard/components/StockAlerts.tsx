import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/shared';
import { useFoodland } from '@/data/store';
export function StockAlerts(){const {db}=useFoodland();const alerts=db.stocks.filter(s=>s.quantity<=s.min).slice(0,4);return <SectionCard title="Hàng hóa cần chú ý" subtitle="Dựa trên tồn hiện tại và ngưỡng cảnh báo" right={<Link className="text-xs font-semibold text-[#0b8b61]" to="/inventory">Xem kho →</Link>}>
 <div className="px-5 pb-4">{alerts.length?alerts.map(item=>{const product=db.products.find(p=>p.id===item.productId);return <div key={item.productId} className="flex items-center justify-between gap-2 border-b border-[#f0f3f0] py-3 last:border-0"><div className="min-w-0"><strong className="block truncate text-xs">{product?.name}</strong><span className="text-[11px] text-[#91a095]">{item.productId} · Tồn {item.quantity} {product?.unit}</span></div><Badge tone={item.quantity===0?'red':'orange'}>{item.quantity===0?'Hết hàng':'Sắp hết'}</Badge></div>}):<p className="muted py-5">Không có cảnh báo tồn kho</p>}</div>
 </SectionCard>;}
