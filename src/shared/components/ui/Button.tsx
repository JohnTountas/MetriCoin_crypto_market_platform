import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
  }
>;

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-cyan-400/90 text-slate-950 shadow-glow hover:bg-cyan-300 disabled:bg-cyan-400/40 disabled:text-slate-700',
  secondary:
    'border border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10 disabled:opacity-50',
  ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
  danger:
    'border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-50',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className,
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
);

