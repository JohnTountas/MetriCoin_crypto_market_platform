import type { SelectHTMLAttributes } from 'react';

import { classNames } from '@/shared/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, children, ...props }: SelectProps) => (
  <select
    className={classNames(
      'surface-input h-11 w-full rounded-2xl px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
      className,
    )}
    {...props}
  >
    {children}
  </select>
);

