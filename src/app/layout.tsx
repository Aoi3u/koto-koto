import type { Metadata } from 'next';
import { Zen_Old_Mincho } from 'next/font/google';
import './globals.css';
import MobileBlocker from '@/components/MobileBlocker';
import Providers from '@/components/Providers';
import AppHeader from '@/components/AppHeader';

const zenOldMincho = Zen_Old_Mincho({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-old-mincho',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Koto-Koto',
  description: 'A digital Zen garden typing experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zenOldMincho.variable} antialiased bg-zen-dark text-off-white overflow-hidden`}
        style={{ fontFamily: 'var(--font-zen-old-mincho, sans-serif)' }}
      >
        <MobileBlocker />
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
