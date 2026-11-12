import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';
export const compact = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
export const dateVN = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('vi-VN');
export const csvEscape = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const contents = '\ufeff' + [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}
