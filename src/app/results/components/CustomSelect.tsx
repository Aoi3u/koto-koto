'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSeasonalTheme } from '@/contexts/SeasonalContext';

export default function CustomSelect<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const seasonalTheme = useSeasonalTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-subtle-gray hover:text-off-white transition-colors py-1 border-b border-transparent"
        style={{
          borderColor: isOpen ? seasonalTheme.adjustedColors.primary : 'rgba(0, 0, 0, 0)',
        }}
      >
        {label && <span className="opacity-50 mr-1">{label}:</span>}
        <span className="font-mono">{selectedLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full right-0 mt-2 min-w-30 bg-zen-dark/90 backdrop-blur-md border border-white/10 rounded-md shadow-xl overflow-hidden z-50"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between group hover:bg-white/5"
                style={{
                  color: value === opt.value ? seasonalTheme.adjustedColors.primary : undefined,
                }}
              >
                <span
                  className={
                    value === opt.value
                      ? 'font-bold'
                      : 'text-subtle-gray group-hover:text-off-white'
                  }
                >
                  {opt.label}
                </span>
                {value === opt.value && (
                  <motion.div
                    layoutId={`check-${label}`}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
