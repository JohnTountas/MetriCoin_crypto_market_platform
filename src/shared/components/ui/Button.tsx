import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { classNames } from '@/shared/utils';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
  }
>;

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--accent-strong)] text-[var(--accent-strong-text)] shadow-glow hover:bg-[var(--accent-strong-hover)] disabled:bg-[var(--accent-bg)] disabled:text-[var(--text-muted)]',
  secondary:
    'border border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--panel-hover)] hover:text-[var(--text-primary)] disabled:opacity-50',
  ghost: 'text-[var(--text-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--text-primary)]',
  danger:
    'border border-[var(--negative-border)] bg-[var(--negative-bg)] text-[var(--negative-text)] hover:opacity-90 disabled:opacity-50',
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
    className={classNames(
      'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed',
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

