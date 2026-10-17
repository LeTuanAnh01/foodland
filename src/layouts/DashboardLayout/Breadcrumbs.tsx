import { Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { navigation } from './navigation';
export function Breadcrumbs(){const path=useLocation().pathname;const selected=navigation.find(n=>path.startsWith(n.to));return <div className="mb-5 flex items-center gap-2 text-[11px] text-[#9baa9f]"><Home size={12}/><span>›</span><span className="font-semibold text-[#687a70]">{selected?.name||'Tổng quan'}</span></div>;}
