import * as React from 'react';
import { cn } from '@/lib/utils';
type Tone = 'green' | 'orange' | 'red' | 'blue' | 'gray';
const tones: Record<Tone, string> = { green:'bg-emerald-50 text-emerald-700',orange:'bg-amber-50 text-amber-700',red:'bg-rose-50 text-rose-700',blue:'bg-blue-50 text-blue-700',gray:'bg-slate-100 text-slate-600' };
export const Badge = ({children,tone='green',className}: React.HTMLAttributes<HTMLSpanElement> & {tone?:Tone}) => <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold',tones[tone],className)}>{children}</span>;
