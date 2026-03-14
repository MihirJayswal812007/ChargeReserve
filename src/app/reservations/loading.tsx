import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationsLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:px-8 max-w-7xl mx-auto w-full mt-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-80 max-w-sm" />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border bg-card rounded-lg p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-3 md:flex-col items-start justify-center min-w-[120px]">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
