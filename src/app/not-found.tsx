import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zen-dark relative flex items-center justify-center px-6">
      <div className="noise-overlay" />
      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-subtle-gray">404 Not Found</p>
        <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-wide">
          The page could not be found.
        </h1>
        <p className="mt-4 text-sm md:text-base text-off-white/80 leading-relaxed">
          The link may be broken, or the page may have been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
