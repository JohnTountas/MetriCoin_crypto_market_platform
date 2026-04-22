// Shared input wrapper that keeps focus treatment and sizing aligned across forms.
// Even simple wrappers like this reduce form drift as more workflows are added.
import { forwardRef, type InputHTMLAttributes } from 'react';

import { classNames } from '@/shared/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={classNames(
        'surface-input h-11 w-full rounded-2xl px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--focus-border)] focus:ring-4 focus:ring-[var(--focus-ring)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

