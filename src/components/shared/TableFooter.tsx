import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PAGE_SIZE } from '@/lib/pagination';

type Props = {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
};

export function TableFooter({ total, page, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const first = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const last = Math.min(total, currentPage * PAGE_SIZE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) =>
    p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <nav aria-label="Phân trang bảng dữ liệu" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ecf0ec] px-4 py-3">
      <span className="text-xs text-[#65776b]">
        Hiển thị {first}–{last} trong {total} dòng · Trang {currentPage} trên {totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" size="sm" variant="outline" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Trang trước">
          <ChevronLeft size={15} /> Trước
        </Button>
        {pages.map((p, i) => (
          <span key={p} className="inline-flex items-center gap-1">
            {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden="true" className="px-1 text-xs text-slate-400">…</span>}
            <Button type="button" size="sm" variant={currentPage === p ? 'default' : 'outline'} aria-label={`Trang ${p}`} aria-current={currentPage === p ? 'page' : undefined} onClick={() => onPageChange(p)}>{p}</Button>
          </span>
        ))}
        <Button type="button" size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Trang sau">
          Sau <ChevronRight size={15} />
        </Button>
      </div>
    </nav>
  );
}
