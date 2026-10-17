import { Link, NavLink } from 'react-router-dom';
import { Boxes, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFoodland } from '@/data/store';
import { countForNavigationPath, getPendingNavigationCounts } from '@/features/documents/utils/documentAttention';
import { cn } from '@/lib/utils';
import { navigation } from './navigation';

const formatCount = (count: number) => count > 99 ? '99+' : String(count);

export function Sidebar() {
  const { db } = useFoodland();
  const counts = getPendingNavigationCounts(db);

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-[#e6ece8] bg-white px-[14px] pb-5 pt-7 lg:flex">
      <Link to="/dashboard" className="mb-10 flex items-center gap-2 px-3">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#098c60] to-[#24ae79] text-white"><Leaf size={23}/></span>
        <span><strong className="block text-[21px] tracking-[-.8px] text-[#0c714c]">Foodland</strong><small className="block text-[10px] tracking-[1.3px] text-[#95a49b]">QUẢN LÝ NỘI BỘ</small></span>
      </Link>
      <div className="mb-2 px-3 text-[10px] font-bold tracking-[1.4px] text-[#a0ada3]">KHÔNG GIAN LÀM VIỆC</div>
      <nav className="space-y-1" aria-label="Điều hướng chính">
        {navigation.map(({ to, name, Icon }) => {
          const count = countForNavigationPath(to, counts);
          return (
            <NavLink key={to} to={to}
              title={count > 0 ? `${count} mục cần xử lý tại ${name}` : undefined}
              className={({ isActive }) => cn(
                'relative flex h-[43px] items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium text-[#64756b] transition hover:bg-[#f4f8f5] hover:text-[#0b774f]',
                isActive && 'bg-[#e7f6ed] !font-bold !text-[#087e55] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-[#0c985f]',
              )}
            >
              <Icon size={17}/>
              <span className="flex-1">{name}</span>
              {count > 0 && <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800" aria-label={`${count} mục cần xử lý`}>{formatCount(count)}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-[#dfefe4] bg-[#f2faf5] p-4">
        <span className="mb-3 inline-flex rounded-xl bg-[#e2f6e9] p-2 text-[#10865b]"><Boxes size={20}/></span>
        <strong className="block text-xs">Prototype tương tác</strong>
        <p className="mt-2 text-[11px] leading-5 text-[#82988a]">Dữ liệu giả lập. Thao tác chỉ lưu trên trình duyệt, không có nghiệp vụ kế toán.</p>
        <Badge>FRONTEND · v0.7.0</Badge>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[#edf0ed] pt-4">
        <span className="grid size-9 place-items-center rounded-full bg-[#13553d] text-xs font-bold text-white">FL</span>
        <div><strong className="block text-xs">Foodland Demo</strong><small className="text-[10px] text-[#839389]">Chế độ xem thử</small></div>
      </div>
    </aside>
  );
}
