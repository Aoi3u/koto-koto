'use client';

import { Laptop } from 'lucide-react';
import useDeviceType from '../hooks/useDeviceType';

export default function MobileBlocker() {
  const { isMobile } = useDeviceType();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-zen-dark flex flex-col items-center justify-center p-8 text-center text-off-white">
      <Laptop className="w-16 h-16 mb-6 text-matcha opacity-80" />
      <h1 className="text-3xl font-zen-old-mincho font-bold mb-4 tracking-widest">PC ONLY</h1>
      <p className="font-inter text-sm text-gray-400 max-w-md leading-relaxed">
        This experience is designed as a digital Zen garden for keyboard interaction.
        <br />
        Please access from a desktop computer.
      </p>
    </div>
  );
}
