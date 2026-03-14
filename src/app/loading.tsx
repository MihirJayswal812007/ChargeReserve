export default function Loading() {
  return (
    <div className="flex-1 min-h-[80vh] flex flex-col bg-zinc-950 items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full mx-auto">
        <div className="h-12 w-12 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin" />
        <div className="h-6 w-32 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
