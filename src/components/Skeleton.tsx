interface SkeletonProps { className?: string }

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-charcoal-100 rounded-lg ${className}`} aria-hidden="true" />;
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex gap-3 items-start">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function SuggestionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-4 space-y-2">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
