import { Skeleton } from "@/components/ui/skeleton";

export default function StationLoading() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-md" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-24 w-32 rounded-xl" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="space-y-4 border bg-card rounded-xl p-6">
              {[1, 2, 3].map((charger) => (
                <div key={charger} className="flex gap-6 items-center p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="border bg-card rounded-2xl overflow-hidden min-h-[400px]">
            <div className="p-6 space-y-4 border-b">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="p-6 bg-muted/20 space-y-4 min-h-[300px]">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-1/5" />
                ))}
              </div>
              <Skeleton className="h-32 w-full mt-4" />
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
