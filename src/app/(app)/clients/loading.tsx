import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="px-8 mt-12 max-w-3xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52 opacity-60" />
            </div>
            <Skeleton className="h-3 w-3 rounded-full opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
}
