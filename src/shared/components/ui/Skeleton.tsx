// Generic loading placeholder used to reserve layout while real content is still arriving.
// It helps async screens stay stable and easier to visually debug.
import { classNames } from '@/shared/utils';

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={classNames('animate-pulse rounded-2xl bg-[var(--panel-hover)]', className)} />
);

