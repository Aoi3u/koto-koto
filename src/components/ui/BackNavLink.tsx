import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group fixed top-20 left-8 z-40 inline-flex items-center gap-2 text-subtle-gray transition-colors hover:text-off-white"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-xs tracking-[0.24em] uppercase font-zen-old-mincho">{label}</span>
    </Link>
  );
}
