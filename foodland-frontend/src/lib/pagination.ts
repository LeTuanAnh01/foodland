/** Single page size for all Foodland data tables. */
export const PAGE_SIZE = 10;

/** Pure pagination calculation, reusable for local mock data and API responses. */
export function paginateRecords<T>(records: readonly T[], requestedPage: number) {
  const total = records.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pages);
  const startIndex = (page - 1) * PAGE_SIZE;
  return {
    page,
    pages,
    startIndex,
    total,
    items: records.slice(startIndex, startIndex + PAGE_SIZE),
  };
}
