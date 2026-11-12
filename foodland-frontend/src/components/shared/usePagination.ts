import * as React from 'react';
import { paginateRecords, PAGE_SIZE } from '@/lib/pagination';

export { PAGE_SIZE } from '@/lib/pagination';

/** UI pagination. Always filter and sort the complete array before calling this hook. */
export function usePagination<T>(
  records: readonly T[],
  resetKeys: readonly unknown[] = [],
  options: { followAppend?: boolean } = {},
) {
  const [page, setPage] = React.useState(1);
  const paged = paginateRecords(records, page);
  const previousLength = React.useRef(records.length);

  React.useEffect(() => { setPage(1); }, resetKeys);
  React.useEffect(() => {
    if (options.followAppend && records.length > previousLength.current) {
      setPage(Math.max(1, Math.ceil(records.length / PAGE_SIZE)));
    }
    previousLength.current = records.length;
  }, [records.length, options.followAppend]);

  return { ...paged, setPage };
}
