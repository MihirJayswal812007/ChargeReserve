'use client';

import { Loader2 } from 'lucide-react';

export default function SessionLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[80vh] bg-zinc-950">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-zinc-400">Loading session details...</p>
    </div>
  );
}
