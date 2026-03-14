import { Skeleton } from "@/components/ui/skeleton";

export default function FindLoading() {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2 mb-8 mt-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-sm" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-md" />
          
          <div className="flex flex-col gap-4 max-h-[600px] overflow-hidden pr-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border bg-card rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-1 border bg-secondary/20 rounded-xl overflow-hidden min-h-[600px] relative">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
