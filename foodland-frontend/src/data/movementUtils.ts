import type {
  StockMovement,
  StockMovementLine,
  StockMovementV2,
} from '@/data/types';

// Các component đọc được cả phiếu trước và sau khi nâng cấp.
export function getStockMovementLines(
  movement: StockMovement | StockMovementV2,
): StockMovementLine[] {
  if ('lines' in movement) return movement.lines;
  return [{ productId: movement.productId, quantity: movement.qty }];
}
