'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import ToastProvider from './ToastProvider';
import { SeasonalProvider } from '../contexts/SeasonalContext';
import { SoundProvider } from '../contexts/SoundContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SeasonalProvider>
        <SoundProvider>
          <ToastProvider>{children}</ToastProvider>
        </SoundProvider>
      </SeasonalProvider>
    </SessionProvider>
  );
}
