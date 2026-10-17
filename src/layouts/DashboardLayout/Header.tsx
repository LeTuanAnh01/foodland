import { Bell, HelpCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useFoodland } from '@/data/store';
import { getPendingNavigationCounts } from '@/features/documents/utils/documentAttention';

export function Header() {
  const { db } = useFoodland();
  const counts = getPendingNavigationCounts(db);
  const destinations = [
    { to: '/purchases', label: 'Mua hàng', count: counts.purchases },
    { to: '/sales', label: 'Bán hàng', count: counts.sales },
    { to: '/inventory', label: 'Phiếu kho nháp', count: counts.inventory },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-[69px] items-center justify-between gap-4 border-b border-[#e6ece8] bg-white/95 px-4 backdrop-blur sm:px-5 md:px-7 lg:px-8 2xl:px-10">
      <div className="relative w-full max-w-[450px]">
        <Search size={16} className="absolute left-3 top-[11px] text-[#95a69b]"/>
        <input aria-label="Tìm kiếm (dữ liệu demo)" placeholder="Tìm kiếm hàng hóa, chứng từ, đối tác..." className="h-10 w-full rounded-[10px] border border-[#e6ede8] bg-[#fbfdfb] pl-10 pr-3 text-xs outline-none focus:border-[#a9d7bb]" readOnly title="Tìm kiếm cụ thể tại từng màn hình"/>
      </div>
      <div className="flex items-center gap-4">
        <Badge className="hidden sm:inline-flex">MOCK DATA</Badge>
        <details className="group relative">
          <summary className="relative flex cursor-pointer list-none items-center text-[#64766c] [&::-webkit-details-marker]:hidden" aria-label={`${counts.total} việc cần xử lý`}
            title={counts.total ? `${counts.total} việc cần xử lý` : 'Không có việc cần xử lý'}>
            <Bell size={18}/>
            {counts.total > 0 && <span className="absolute -right-1.5 -top-1.5 size-[8px] rounded-full bg-amber-500 ring-2 ring-white"/>}
          </summary>
          <div className="absolute right-0 top-8 z-50 w-[min(320px,85vw)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <p className="text-xs font-bold text-slate-800">Công việc cần kiểm tra</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Số đếm được cập nhật từ toàn bộ dữ liệu, không phụ thuộc bộ lọc.</p>
            <div className="mt-2 space-y-1">
              {destinations.map(({ to, label, count }) => (
                <Link key={to} to={to} className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-amber-50">
                  <span>{label}</span>
                  <span className={count ? 'font-bold text-amber-700' : 'text-slate-400'}>{count} mục</span>
                </Link>
              ))}
            </div>
          </div>
        </details>
        <HelpCircle size={18} className="hidden text-[#64766c] sm:block"/>
        <span className="hidden h-7 w-px bg-[#e6ece8] sm:block"/>
        <span className="grid size-9 place-items-center rounded-full bg-[#13553d] text-xs font-bold text-white">FL</span>
        <div className="hidden sm:block"><strong className="block text-xs">Foodland Demo</strong><small className="text-[10px] text-[#829188]">Người xem thử</small></div>
      </div>
    </header>
  );
}
