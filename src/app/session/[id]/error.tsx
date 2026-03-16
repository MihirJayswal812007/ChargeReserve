'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Session error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 min-h-[80vh] bg-zinc-950">
      <div className="bg-red-500/10 p-4 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Session Error
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          We couldn&apos;t load your charging session. The session might have ended or there might be a network issue.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
