import type { HTMLAttributes, PropsWithChildren } from 'react';

import { classNames } from '@/shared/utils';

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean;
  }
>;

export const Card = ({ children, className, elevated = false, ...props }: CardProps) => (
  <div
    className={classNames(
      'surface rounded-3xl',
      elevated ? 'shadow-panel' : 'shadow-none',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

