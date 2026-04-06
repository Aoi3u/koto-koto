'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zen-dark relative flex items-center justify-center px-6">
      <div className="noise-overlay" />
      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-subtle-gray">500 Server Error</p>
        <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-wide">
          Something went wrong.
        </h1>
        <p className="mt-4 text-sm md:text-base text-off-white/80 leading-relaxed">
          Please retry. If the issue persists, return to the home page and try again later.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-colors"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
