import { Skeleton } from '@/shared/components/ui';

export const PageLoadingSkeleton = () => (
  <div className="min-h-screen p-6 lg:p-8">
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Skeleton className="hidden h-[calc(100vh-4rem)] rounded-[2rem] lg:block" />
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-[2rem]" />
        <Skeleton className="h-48 rounded-[2rem]" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-80 rounded-[2rem] xl:col-span-2" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
      </div>
    </div>
  </div>
);

