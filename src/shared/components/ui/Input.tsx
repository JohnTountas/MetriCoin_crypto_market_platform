import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
      className,
    )}
    {...props}
  />
);

