import type { StockCheck, StockMovementKind } from '@/data/types';

// Không cấp lại mã nhỏ hơn nếu có khoảng trống số do xóa phiếu.
export function nextMovementId(
  movements: Array<{ id: string }>,
  kind: StockMovementKind,
) {
  const prefix = kind === 'Nhập kho' ? 'PN' : 'PX';
  const pattern = new RegExp(`^${prefix}(\\d+)$`, 'i');
  const highest = movements.reduce((max, movement) => {
    const match = movement.id.match(pattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
}

export function nextStockCheckId(checks: StockCheck[]) {
  const highest = checks.reduce((max, check) => {
    const match = check.id.match(/^KK(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `KK${String(highest + 1).padStart(4, '0')}`;
}

export function localToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
