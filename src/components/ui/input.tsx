import * as React from 'react';
import { cn } from '@/lib/utils';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn('h-9 w-full rounded-[9px] border border-[#e1e9e3] bg-white px-3 text-[13px] text-[#253d31] outline-none placeholder:text-[#a2ada6] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100', className)} {...props}/>);
Input.displayName = 'Input';
