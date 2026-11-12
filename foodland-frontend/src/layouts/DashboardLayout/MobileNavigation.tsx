import { Link, useLocation } from 'react-router-dom';
import { useFoodland } from '@/data/store';
import { countForNavigationPath, getPendingNavigationCounts } from '@/features/documents/utils/documentAttention';
import { cn } from '@/lib/utils';
import { navigation } from './navigation';

export function MobileNavigation() {
  const path = useLocation().pathname;
  const { db } = useFoodland();
  const counts = getPendingNavigationCounts(db);

  return (
    <div className="border-b border-[#e6ece8] bg-white px-4 py-2 lg:hidden">
      <nav className="flex gap-4 overflow-x-auto text-xs" aria-label="Điều hướng di động">
        {navigation.map((item) => {
          const count = countForNavigationPath(item.to, counts);
          return <Link key={item.to} to={item.to} className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap', path === item.to ? 'font-bold text-emerald-700' : 'text-gray-600')}>
            {item.name}
            {count > 0 && <span title={`${count} mục cần xử lý`} className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800" aria-label={`${count} mục cần xử lý`}>{count > 99 ? '99+' : count}</span>}
          </Link>;
        })}
      </nav>
    </div>
  );
}
