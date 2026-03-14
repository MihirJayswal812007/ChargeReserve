import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 pt-6 w-full max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <div key={key} className="border bg-card text-card-foreground rounded-lg p-6 space-y-2 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="border bg-card rounded-lg h-[400px]">
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="border bg-card rounded-lg h-[400px] p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
