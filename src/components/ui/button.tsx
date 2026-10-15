import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
const variants = cva('inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plant disabled:pointer-events-none disabled:opacity-50', {
  variants: { variant: { primary: 'bg-plant text-white hover:bg-ink', outline: 'border border-line bg-white text-plant hover:bg-mist', ghost: 'text-plant hover:bg-mist' }, size: { default: 'h-10 px-4', small: 'h-9 px-3' } },
  defaultVariants: { variant: 'primary', size: 'default' },
});
type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>;
export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant, size, ...props }, ref) => <button ref={ref} className={cn(variants({ variant, size }), className)} {...props}/>);
Button.displayName = 'Button';
