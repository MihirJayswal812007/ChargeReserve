'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 min-h-[80vh] bg-zinc-950">
      <div className="bg-red-500/10 p-4 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Something went wrong!
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
      </div>

      <Button onClick={() => reset()} size="lg" className="gap-2 mt-4">
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}
