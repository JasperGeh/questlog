'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-900">
      <div className="max-w-2xl w-full bg-[#1a1625] p-8 rounded-lg border border-[#3d3554] shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-amber-100 font-serif">
          A Dark Mist Has Enveloped Your Quest
        </h1>
        
        <div className="mb-6 p-4 bg-[#2a233c] border-l-4 border-amber-900 rounded">
          <p className="text-gray-300 italic">
            "The ancient scrolls have become corrupted. A malevolent force has interrupted your journey."
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#3f5a45] text-[#d3cfe1] rounded-md border border-[#4f7259] font-medium hover:translate-y-[-2px] transition-all duration-200 hover:shadow-lg"
          >
            Try Again
          </button>
          
          <Link 
            href="/"
            className="px-6 py-3 bg-[#312843] text-[#d3cfe1] rounded-md border border-[#4a3e67] font-medium hover:translate-y-[-2px] transition-all duration-200 hover:shadow-lg"
          >
            Return to Quest Log
          </Link>
        </div>
      </div>
    </div>
  );
} 