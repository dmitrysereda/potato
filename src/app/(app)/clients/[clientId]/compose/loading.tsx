import { Skeleton } from "@/components/ui/skeleton";

export default function ComposeLoading() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Platform checkboxes */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 mb-3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        {/* Textarea */}
        <Skeleton className="h-32 w-full rounded-lg" />
        {/* Submit button */}
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
