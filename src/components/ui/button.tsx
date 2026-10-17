import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva('inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4', {
  variants: { variant: {
    default: 'bg-[#0d8c62] text-white hover:bg-[#097552] shadow-sm',
    outline: 'border border-[#dfe8e2] bg-white text-[#3e554a] hover:bg-[#f4f8f5]',
    ghost: 'bg-transparent text-[#4d655a] hover:bg-[#edf5ef]',
    destructive: 'bg-[#fff0f0] text-[#c34c54] hover:bg-[#ffe4e4]'
  }, size: { default: 'h-9 px-4', sm: 'h-8 px-3 text-xs', icon: 'size-9' } },
  defaultVariants: { variant: 'default', size: 'default' }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({variant, size}), className)} ref={ref} {...props}/>;
});
Button.displayName = 'Button';
