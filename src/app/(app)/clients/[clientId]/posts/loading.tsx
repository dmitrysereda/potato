import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <div className="p-8">
      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3 max-w-3xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-card border border-border rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 opacity-60" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 opacity-70" />
          </div>
        ))}
      </div>
    </div>
  );
}
