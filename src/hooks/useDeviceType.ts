'use client';

import { useEffect, useState } from 'react';
import { detectMobileDevice } from '../lib/device-detection';

export default function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Multi-factor mobile detection
      const isMobileDevice = detectMobileDevice();
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
}
