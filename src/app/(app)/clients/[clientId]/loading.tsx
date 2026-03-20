import { Skeleton } from "@/components/ui/skeleton";

// Shown while the clientId layout fetches the client (header + tab nav)
export default function ClientLayoutLoading() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        {/* Tab nav placeholder */}
        <div className="flex gap-1 border-b border-border pb-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-t-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
