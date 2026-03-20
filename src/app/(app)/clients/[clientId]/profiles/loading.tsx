import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilesLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20 opacity-60" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
