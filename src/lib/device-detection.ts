/**
 * Extended Navigator interface to include experimental APIs
 */
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

/**
 * Detects if the current device is a mobile phone (not tablet)
 * Uses multiple factors for accurate detection
 */
export const detectMobileDevice = (): boolean => {
  // Factor 1: Touch capability detection (most reliable)
  const hasTouch = (): boolean =>
    !!(navigator.maxTouchPoints > 0 || (matchMedia && matchMedia('(pointer:coarse)').matches));

  // Factor 2: User Agent analysis
  const isMobileUA = (): boolean => {
    const ua = navigator.userAgent.toLowerCase();
    // Mobile phones
    const mobilePhones =
      /iphone|android|blackberry|kiwibird|mobile|mobi|netfront|opera mini|opera mobi|opera mobile|phone|silk|symbian|webos/;
    // Tablet exceptions - we allow iPads as they are productivity devices
    const isTablet =
      /ipad|android.*tablet|playbook|kindle|nexus 7|nexus 10|xoom|sch-i800|gt-p1000|gt-p1010|gt-p6210|gt-p6800|gt-p7100|gt-p7300|gt-p7310|gt-p7500|gt-p7510|gt-p8110|gt-p8510|sc-01c|sc-02c|sgh-t849|sgh-t959|shw-m180s|shw-m305w|shw-m900|shv-e140k|shv-e140l|shv-e140s|shv-e150s|shv-e160k|shv-e160l|shv-e160s|shv-e230k|shv-e230l|shv-e230s|shv-m110s|shv-m180s|smg-r950|sph-p100|sph-p110|sph-p3113|sph-p3100|sph-p5100|sph-p7100|sph-p7110|sph-t210|sph-t211|sph-t215|sph-t217|sph-t21s|sph-t30|sph-t210|sph-t810|sph-t820|sph-t827|spt-tr|sv-p041|sv-p200|sv-p210|sv-p511|sv-p512|sv-p513|sv-p514|sv-p6|sv-p6 build|sv-p7|sv-p7110|sv-p8110|verizon build|vodafone build|vf-s15|vf-s21|vf-sfx|vf-xps|vp1012|vp202|vp4002|vp4202|vp5552|vp6111|vp6121|vp6151|vp6152|vp6251|vp6552|vp7501|vp7502|vp7511|vp7512|vs15007|vs95007|wy-th9|za9|zen-ait|zen-m60/i;

    // Check if it matches mobile phone pattern and is NOT a tablet
    return mobilePhones.test(ua) && !isTablet.test(ua);
  };

  // Factor 3: Device memory (most mobile devices have low memory)
  const hasLowMemory = (): boolean => {
    const deviceMemory = (navigator as ExtendedNavigator).deviceMemory;
    return deviceMemory ? deviceMemory <= 4 : false;
  };

  // Factor 4: Screen size heuristic (only as secondary indicator)
  // Modern mobile devices are no longer always small, but combined with other factors it helps
  const isSmallScreenMobile = (): boolean => {
    // Only consider it mobile if screen is small AND has other mobile indicators
    return window.innerWidth < 768; // Mobile-first breakpoint
  };

  // Factor 5: Orientation lock detection (mobile devices often support this)
  const hasOrientationLock = (): boolean => {
    return (
      window.screen.orientation !== undefined &&
      typeof (window.screen.orientation as unknown as { lock: unknown }).lock === 'function'
    );
  };

  // Combine factors with weighted logic
  // If touch is detected + any other factor, it's likely mobile
  if (hasTouch()) {
    // Touch + mobile UA OR touch + small screen OR touch + low memory
    return isMobileUA() || (isSmallScreenMobile() && window.innerWidth < 1024) || hasLowMemory();
  }

  // Strict mobile phone detection from UA
  if (isMobileUA()) {
    return true;
  }

  // Additional safeguard: all factors suggest mobile
  if (isSmallScreenMobile() && hasOrientationLock() && hasLowMemory()) {
    return true;
  }

  return false;
};
