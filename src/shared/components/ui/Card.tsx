import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean;
  }
>;

export const Card = ({ children, className, elevated = false, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-3xl border border-white/10 bg-slate-900/75 backdrop-blur-xl',
      elevated ? 'shadow-panel' : 'shadow-none',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

