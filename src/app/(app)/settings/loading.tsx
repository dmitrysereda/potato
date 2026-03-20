import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <Skeleton className="h-7 w-24 mb-8" />

      <section className="mt-8">
        <Skeleton className="h-4 w-28 mb-4" />
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44 opacity-60" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-16 opacity-60" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
