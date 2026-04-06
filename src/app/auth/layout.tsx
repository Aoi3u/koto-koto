import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account | Koto-Koto',
  description: 'Sign in or create your Koto-Koto account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
