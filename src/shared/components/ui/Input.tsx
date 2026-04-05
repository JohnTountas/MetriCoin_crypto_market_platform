import { forwardRef, type InputHTMLAttributes } from 'react';

import { classNames } from '@/shared/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={classNames(
        'surface-input h-11 w-full rounded-2xl px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

