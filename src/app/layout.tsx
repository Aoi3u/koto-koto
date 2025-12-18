import type { Metadata } from 'next';
import { Zen_Old_Mincho, Inter } from 'next/font/google'; // Zen Old Mincho for Japanese, Inter for UI
import './globals.css';
import MobileBlocker from '@/components/MobileBlocker';

const zenOldMincho = Zen_Old_Mincho({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'], // Note: Google Fonts may not have 'japanese' subset explicitly listed in types sometimes, but usually 'latin' is enough to load the font, or we omit subsets for variable fonts if applicable.
  // However, Zen Old Mincho is not variable, we need weights.
  // Actually, for Japanese fonts in Next.js, we often need preload: false if subset is not fully supported or just standard usage.
  // Let's try standard config.
  variable: '--font-zen-old-mincho',
  preload: false,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Koto-Koto | Japanese Typing Zen',
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
        className={`${zenOldMincho.variable} ${inter.variable} antialiased bg-zen-dark text-off-white overflow-hidden`}
      >
        <MobileBlocker />
        {children}
      </body>
    </html>
  );
}
