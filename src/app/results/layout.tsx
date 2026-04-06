import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Results | Koto-Koto',
  description: 'Your typing history and ranking.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
