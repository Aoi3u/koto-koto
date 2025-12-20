import { detectMobileDevice } from '@/lib/device-detection';

describe('detectMobileDevice', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Touch capability detection', () => {
    it('should detect mobile when maxTouchPoints > 0 and has mobile UA', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 1,
      });
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });
      expect(detectMobileDevice()).toBe(true);
    });

    it('should detect mobile when maxTouchPoints > 0 and small screen', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 1,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      expect(detectMobileDevice()).toBe(true);
    });
  });

  describe('User Agent detection', () => {
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
      'Mozilla/5.0 (Linux; Android 10; SM-G960F)',
      'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1)',
      'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900)',
      'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0)',
    ];

    mobileUserAgents.forEach((ua) => {
      it(`should detect mobile for UA: ${ua.substring(0, 50)}...`, () => {
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          configurable: true,
          value: ua,
        });
        expect(detectMobileDevice()).toBe(true);
      });
    });

    it('should not detect desktop user agent as mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0,
      });
      expect(detectMobileDevice()).toBe(false);
    });
  });

  describe('Device memory detection', () => {
    it('should detect mobile when deviceMemory <= 4GB', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10)',
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        configurable: true,
        value: 4,
      });
      expect(detectMobileDevice()).toBe(true);
    });
  });

  describe('Screen size detection', () => {
    it('should detect mobile when screen is small and has orientation lock', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window.screen, 'orientation', {
        writable: true,
        configurable: true,
        value: {
          lock: jest.fn(),
        },
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        configurable: true,
        value: 2,
      });
      expect(detectMobileDevice()).toBe(true);
    });
  });

  describe('Combined scenarios', () => {
    it('should detect mobile with multiple indicators', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 1,
      });
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        configurable: true,
        value: 2,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      expect(detectMobileDevice()).toBe(true);
    });

    it('should handle edge case: touch-enabled desktop with mobile UA', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 1,
      });
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G960F)',
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      // Should detect as mobile due to touch + mobile UA
      expect(detectMobileDevice()).toBe(true);
    });
  });
});
