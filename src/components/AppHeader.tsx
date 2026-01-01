'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, VolumeX, LogOut, User, History as HistoryIcon, X, Trophy } from 'lucide-react';
import { useSeasonalTheme } from '@/contexts/SeasonalContext';
import { useSoundContext } from '@/contexts/SoundContext';
import type { KeyboardSoundProfile } from '@/features/game/hooks/useSound';

export default function AppHeader() {
  const { data: session, status } = useSession();
  const seasonalTheme = useSeasonalTheme();
  const { currentProfile, changeProfile, availableProfiles, hasAudioSupport, isProfileLoading } =
    useSoundContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userLabel = session?.user?.name ?? session?.user?.email ?? 'Guest';
  const profiles = Object.keys(availableProfiles) as KeyboardSoundProfile[];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 pointer-events-none"
    >
      {/* Logo Area */}
      <div className="pointer-events-auto">
        <Link
          href="/"
          className="text-off-white font-zen-old-mincho tracking-[0.2em] text-sm uppercase transition-colors duration-500"
          style={{
            textShadow: `0 0 20px ${seasonalTheme.adjustedColors.glow}40`,
          }}
        >
          Koto-Koto
        </Link>
      </div>

      {/* Right Side Actions */}
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          href="/results?tab=rankings"
          className="p-2 rounded-full transition-colors duration-300 hover:bg-white/5 text-subtle-gray hover:text-off-white"
          aria-label="Leaderboard"
        >
          <Trophy className="w-5 h-5" />
        </Link>

        <Link
          href="/results?tab=history"
          className="p-2 rounded-full transition-colors duration-300 hover:bg-white/5 text-subtle-gray hover:text-off-white"
          aria-label="History"
        >
          <HistoryIcon className="w-5 h-5" />
        </Link>

        <Link
          href="/auth"
          className="p-2 rounded-full transition-colors duration-300 hover:bg-white/5 text-subtle-gray hover:text-off-white"
          aria-label={status === 'authenticated' ? 'Profile' : 'Sign In'}
        >
          <User className="w-5 h-5" />
        </Link>

        {/* Settings Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full transition-colors duration-300 hover:bg-white/5 text-subtle-gray hover:text-off-white"
            aria-label="Settings"
          >
            <Settings
              className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-4 w-72 rounded-lg backdrop-blur-xl border shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(15, 20, 25, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px ${seasonalTheme.adjustedColors.glow}10`,
                }}
              >
                {/* Header of Menu */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-zen-old-mincho tracking-widest text-subtle-gray uppercase">
                    Settings
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-subtle-gray hover:text-off-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2 space-y-1">
                  {/* Navigation Links */}
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 text-sm text-off-white transition-colors group"
                  >
                    <User className="w-4 h-4 text-subtle-gray group-hover:text-off-white" />
                    <span className="font-zen-old-mincho tracking-wider">Account</span>
                  </Link>

                  <div className="my-2 border-t border-white/5" />

                  {/* Sound Settings */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-subtle-gray font-zen-old-mincho tracking-wider">
                        Keyboard Sound
                      </span>
                      {!hasAudioSupport && <VolumeX className="w-3 h-3 text-red-400" />}
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {profiles.map((profile) => (
                        <button
                          key={profile}
                          onClick={() => changeProfile(profile)}
                          disabled={!hasAudioSupport || isProfileLoading}
                          className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all ${
                            currentProfile === profile
                              ? 'bg-white/10 text-off-white'
                              : 'text-subtle-gray hover:bg-white/5 hover:text-off-white'
                          }`}
                        >
                          <span>{availableProfiles[profile].name}</span>
                          {currentProfile === profile && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out (only if authenticated) */}
                  {status === 'authenticated' && (
                    <>
                      <div className="my-2 border-t border-white/5" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-sm text-red-200 transition-colors group"
                      >
                        <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                        <span className="font-zen-old-mincho tracking-wider">Sign Out</span>
                      </button>
                    </>
                  )}
                </div>

                {/* User Info Footer */}
                {status === 'authenticated' && (
                  <div className="px-4 py-3 bg-white/5 border-t border-white/5">
                    <div className="text-xs text-subtle-gray font-zen-old-mincho truncate">
                      Signed in as <span className="text-off-white">{userLabel}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
