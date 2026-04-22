// Card is the default surface primitive for Metricoin panels and grouped content.
// Reusing one wrapper keeps spacing and visual depth easier to maintain at scale.
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
      elevated && 'shadow-panel',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

