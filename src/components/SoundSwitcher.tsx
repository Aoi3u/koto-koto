"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import type { KeyboardSoundProfile } from "@/features/game/hooks/useSound";

interface SoundSwitcherProps {
  currentProfile: KeyboardSoundProfile;
  onProfileChange: (profile: KeyboardSoundProfile) => void;
  availableProfiles: Record<
    KeyboardSoundProfile,
    { name: string; [key: string]: any }
  >;
}

export default function SoundSwitcher({
  currentProfile,
  onProfileChange,
  availableProfiles,
}: SoundSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const profiles = Object.keys(availableProfiles) as KeyboardSoundProfile[];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-xl overflow-hidden min-w-[200px] max-h-[400px] overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile}
                onClick={() => {
                  onProfileChange(profile);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 hover:bg-zinc-800/80 ${
                  currentProfile === profile
                    ? "bg-zinc-800/60 text-white font-medium"
                    : "text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{availableProfiles[profile].name}</span>
                  {currentProfile === profile && (
                    <span className="text-xs text-zinc-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-lg hover:bg-zinc-800/90 hover:border-zinc-600/50 transition-all duration-200 group"
          aria-label="Change keyboard sound"
        >
          <Volume2 className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
          <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {availableProfiles[currentProfile].name}
          </span>
        </button>
      </div>
    </div>
  );
}
