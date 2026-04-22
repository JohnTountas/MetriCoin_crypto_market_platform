// Styled native select wrapper for forms that need the browser's built-in accessibility.
// Using the native element here keeps validation and keyboard behavior predictable.
import { forwardRef, type SelectHTMLAttributes } from 'react';

import { classNames } from '@/shared/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      className={classNames(
        'surface-input h-11 w-full rounded-2xl px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--focus-border)] focus:ring-4 focus:ring-[var(--focus-ring)]',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

