import type { Metadata } from 'next';
import { Zen_Old_Mincho } from 'next/font/google';
import './globals.css';
import MobileBlocker from '@/components/MobileBlocker';
import Providers from '@/components/Providers';
import AppHeader from '@/components/AppHeader';
import { absoluteUrl, getSiteUrl } from '@/lib/site-url';

const zenOldMincho = Zen_Old_Mincho({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-old-mincho',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Koto-Koto',
  description: 'A digital Zen garden typing experience.',
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Koto-Koto',
    title: 'Koto-Koto',
    description: 'A digital Zen garden typing experience.',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'Koto-Koto',
    description: 'A digital Zen garden typing experience.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Koto-Koto',
  url: getSiteUrl(),
  inLanguage: ['ja', 'en'],
  description: 'A digital Zen garden typing experience.',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Koto-Koto',
  url: getSiteUrl(),
  logo: absoluteUrl('/favicon.ico'),
  sameAs: ['https://github.com/Aoi3u/koto-koto'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${zenOldMincho.variable} antialiased bg-zen-dark text-off-white overflow-hidden`}
        style={{ fontFamily: 'var(--font-zen-old-mincho, sans-serif)' }}
      >
        <Providers>
          <MobileBlocker />
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
