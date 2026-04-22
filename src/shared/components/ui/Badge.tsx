// Small tone-based status primitive used across health, alerts, and summary surfaces.
// Centralizing badge styling keeps semantic colors from drifting over time.
import type { HTMLAttributes, PropsWithChildren } from 'react';

import { classNames } from '@/shared/utils';

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: 'default' | 'positive' | 'negative' | 'warning';
  }
>;

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'tone-default',
  positive: 'tone-positive',
  negative: 'tone-negative',
  warning: 'tone-warning',
};

export const Badge = ({ children, className, tone = 'default', ...props }: BadgeProps) => (
  <span
    className={classNames(
      'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]',
      toneClasses[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

