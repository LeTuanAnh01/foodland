import * as React from 'react';
import { cn } from '@/lib/utils';
export const Card = ({className,...props}:React.HTMLAttributes<HTMLDivElement>)=><div className={cn('rounded-[14px] border border-[#e6ece7] bg-white shadow-[0_3px_20px_rgba(16,42,28,0.03)]',className)} {...props}/>;
