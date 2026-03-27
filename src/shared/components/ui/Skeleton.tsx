import { classNames } from '@/shared/utils';

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={classNames('animate-pulse rounded-2xl bg-[var(--panel-hover)]', className)} />
);

