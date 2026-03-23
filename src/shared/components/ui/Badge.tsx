import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: 'default' | 'positive' | 'negative' | 'warning';
  }
>;

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'border-white/10 bg-white/5 text-slate-200',
  positive: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  negative: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
};

export const Badge = ({ children, className, tone = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]',
      toneClasses[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

