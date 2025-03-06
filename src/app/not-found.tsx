'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-900">
      <div className="max-w-2xl w-full bg-[#1a1625] p-8 rounded-lg border border-[#3d3554] shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-amber-100 font-serif">
          The Path Has Faded Into Shadow
        </h1>
        
        <div className="relative w-full h-40 mb-6 opacity-80">
          <Image
            src="/header.png"
            alt="Mystical path"
            fill
            className="object-cover rounded"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625] to-transparent"></div>
        </div>
        
        <p className="mb-6 text-gray-300 italic">
          The page you seek has been consumed by the void, or perhaps never existed in this realm.
          The ancient scrolls make no mention of this destination.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-[#312843] text-[#d3cfe1] rounded-md border border-[#4a3e67] font-medium hover:translate-y-[-2px] transition-all duration-200 hover:shadow-lg"
        >
          Return to the Quest Log
        </Link>
      </div>
    </div>
  );
} 