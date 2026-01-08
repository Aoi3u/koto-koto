'use client';

import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { calculateRank } from '@/features/result/utils/rankLogic';
import { calculateZenScore } from '@/lib/formatters';
import { useSeasonalTheme } from '@/contexts/SeasonalContext';

type HistoryItem = {
  id: string;
  createdAt: string;
  wpm: number;
  accuracy: number;
  keystrokes: number;
  correctKeystrokes: number;
  elapsedTime: number;
  difficulty: string;
};

type RankingItem = {
  rank: number;
  user: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
  zenScore?: number;
  grade?: string;
  title?: string;
  color?: string;
};

const timeframeOptions = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'all', label: 'All time' },
] as const;

const limitOptions = [50, 100, 200];

function CustomSelect<T extends string | number>({
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

function ResultsPageContent() {
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const seasonalTheme = useSeasonalTheme();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<'history' | 'rankings'>('history');

  // Data states
  const [history, setHistory] = useState<{
    loading: boolean;
    error: string | null;
    data: HistoryItem[];
  }>({ loading: false, error: null, data: [] });
  const [rankings, setRankings] = useState<{
    loading: boolean;
    error: string | null;
    data: RankingItem[];
  }>({ loading: false, error: null, data: [] });

  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month' | 'day'>('all');
  const [limit, setLimit] = useState<number>(50);

  // Scroll detection refs
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const rankingsScrollRef = useRef<HTMLDivElement>(null);
  const [historyScrollState, setHistoryScrollState] = useState({ top: false, bottom: false });
  const [rankingsScrollState, setRankingsScrollState] = useState({ top: false, bottom: false });

  // Handle scroll detection
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>, isRankings: boolean) => {
    const element = e.currentTarget;
    const hasScrollTop = element.scrollTop > 10;
    const hasScrollBottom = element.scrollTop < element.scrollHeight - element.clientHeight - 10;

    if (isRankings) {
      setRankingsScrollState({ top: hasScrollTop, bottom: hasScrollBottom });
    } else {
      setHistoryScrollState({ top: hasScrollTop, bottom: hasScrollBottom });
    }
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'rankings') setTab('rankings');
    else if (tabParam === 'history') setTab('history');
  }, [searchParams]);

  // Check scroll state on data load
  useEffect(() => {
    const checkScroll = (ref: React.RefObject<HTMLDivElement | null>, isRankings: boolean) => {
      if (ref.current) {
        const element = ref.current;
        const hasScrollTop = element.scrollTop > 10;
        const hasScrollBottom =
          element.scrollTop < element.scrollHeight - element.clientHeight - 10;

        if (isRankings) {
          setRankingsScrollState({ top: hasScrollTop, bottom: hasScrollBottom });
        } else {
          setHistoryScrollState({ top: hasScrollTop, bottom: hasScrollBottom });
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      checkScroll(historyScrollRef, false);
      checkScroll(rankingsScrollRef, true);
    }, 100);

    return () => clearTimeout(timer);
  }, [history.data, rankings.data]);

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    setHistory((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/game-results', { cache: 'no-store' });
      if (res.status === 401) {
        setHistory({ loading: false, error: 'Sign in to view your history.', data: [] });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch history');
      const body = await res.json();
      setHistory({ loading: false, error: null, data: body.results ?? [] });
    } catch {
      setHistory({ loading: false, error: 'Failed to load history', data: [] });
      addToast('Failed to load history', 'error');
    }
  }, [session?.user, addToast]);

  const fetchRankings = useCallback(async () => {
    setRankings((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ timeframe, limit: String(limit) });
      const res = await fetch(`/api/rankings?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch rankings');
      const body = await res.json();
      setRankings({ loading: false, error: null, data: body.results ?? [] });
    } catch {
      setRankings({ loading: false, error: 'Failed to load rankings', data: [] });
      addToast('Failed to load rankings', 'error');
    }
  }, [timeframe, limit, addToast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, fetchHistory]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const historyContent = useMemo(() => {
    if (status !== 'authenticated') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-subtle-gray font-zen-old-mincho"
        >
          Sign in to view your journey.
        </motion.div>
      );
    }
    if (history.loading) return <div className="text-subtle-gray text-sm py-8">Loading...</div>;
    if (history.error) return <div className="text-subtle-gray text-sm py-8">{history.error}</div>;
    if (history.data.length === 0)
      return <div className="text-subtle-gray text-sm py-8">No results yet.</div>;

    return (
      <div
        ref={historyScrollRef}
        onScroll={(e) => handleScroll(e, false)}
        className={`grid gap-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2 scrollbar-thin scroll-container ${
          historyScrollState.top ? 'has-scroll-top' : ''
        } ${historyScrollState.bottom ? 'has-scroll-bottom' : ''}`}
      >
        {history.data.map((item, i) => {
          const rankResult = calculateRank(item.wpm, item.accuracy);
          const zenScore = calculateZenScore(item.wpm, item.accuracy);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-4 flex items-center justify-between transition-all duration-300"
              style={{
                borderColor: 'rgba(255,255,255,0.05)',
              }}
              whileHover={{
                borderColor: seasonalTheme.adjustedColors.primary,
                boxShadow: `0 0 15px ${seasonalTheme.adjustedColors.glow}20`,
              }}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 text-center hidden md:block">
                  <div className={`text-lg font-bold font-zen-old-mincho ${rankResult.color}`}>
                    {rankResult.grade}
                  </div>
                  <div className="text-[9px] text-subtle-gray leading-tight tracking-wider uppercase line-clamp-1">
                    {rankResult.title}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-subtle-gray font-mono mb-1">
                    {new Date(item.createdAt).toLocaleDateString()} •{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block relative group/zen">
                  <div className="text-sm text-off-white font-mono font-bold cursor-help">
                    {zenScore}
                  </div>
                  <div className="text-[10px] text-subtle-gray uppercase">Zen</div>
                  {/* Tooltip for Zen Score */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/zen:opacity-100 group-hover/zen:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    <div className="text-[10px] text-off-white font-mono mb-1">
                      Zen Score = WPM × Accuracy ÷ 100
                    </div>
                    <div className="text-[9px] text-subtle-gray font-mono">
                      = {item.wpm} × {item.accuracy}% ÷ 100
                    </div>
                  </div>
                </div>
                <div className="relative group/wpm">
                  <div className="text-xl font-light font-inter text-off-white cursor-help">
                    {item.wpm}
                  </div>
                  <div className="text-[10px] text-subtle-gray uppercase">WPM</div>
                  {/* Tooltip for WPM */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/wpm:opacity-100 group-hover/wpm:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    <div className="text-[10px] text-off-white font-mono mb-1">
                      WPM = (Correct Keys ÷ 5) ÷ Minutes
                    </div>
                    <div className="text-[9px] text-subtle-gray font-mono">
                      = ({item.correctKeystrokes} ÷ 5) ÷ {(item.elapsedTime / 60).toFixed(2)}m
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm text-subtle-gray font-mono">{item.accuracy}%</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [history, status, seasonalTheme, historyScrollState, handleScroll]);

  const rankingsContent = useMemo(() => {
    if (rankings.loading) return <div className="text-subtle-gray text-sm py-8">Loading...</div>;
    if (rankings.error)
      return <div className="text-subtle-gray text-sm py-8">{rankings.error}</div>;
    if (rankings.data.length === 0)
      return <div className="text-subtle-gray text-sm py-8">No rankings yet.</div>;

    return (
      <div
        ref={rankingsScrollRef}
        onScroll={(e) => handleScroll(e, true)}
        className={`grid gap-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2 scrollbar-thin scroll-container ${
          rankingsScrollState.top ? 'has-scroll-top' : ''
        } ${rankingsScrollState.bottom ? 'has-scroll-bottom' : ''}`}
      >
        {rankings.data.map((item, i) => (
          <motion.div
            key={`${item.rank}-${item.user}-${item.createdAt}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`flex items-center p-3 rounded-md border transition-all duration-300 ${
              item.rank === 1
                ? 'bg-yellow-700/20 border-yellow-700/30'
                : item.rank === 2
                  ? 'bg-white/10 border-white/20'
                  : item.rank === 3
                    ? 'bg-orange-700/20 border-orange-700/30'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/20'
            }`}
            style={
              item.rank > 3
                ? {
                    borderColor: 'rgba(0, 0, 0, 0)',
                  }
                : {}
            }
            whileHover={
              item.rank > 3
                ? {
                    borderColor: seasonalTheme.adjustedColors.primary,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                : {}
            }
          >
            <div
              className={`w-8 text-center font-mono font-bold ${
                item.rank <= 3 ? 'text-off-white' : 'text-subtle-gray'
              }`}
            >
              {item.rank}
            </div>
            <div className="flex-1 min-w-0 px-3">
              <div className="text-off-white font-zen-old-mincho truncate">{item.user}</div>
              <div className="text-[10px] text-subtle-gray">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
            {item.grade && (
              <div className="w-12 text-center hidden md:block">
                <div className="text-base text-subtle-gray font-bold font-zen-old-mincho">
                  {item.grade}
                </div>
              </div>
            )}
            <div className="w-16 text-right hidden sm:block relative group/zen">
              <div className="text-sm text-off-white font-mono font-semibold cursor-help">
                {item.zenScore}
              </div>
              <div className="text-[10px] text-subtle-gray uppercase">Zen</div>
              {/* Tooltip for Zen Score */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/zen:opacity-100 group-hover/zen:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <div className="text-[10px] text-off-white font-mono mb-1">
                  Zen Score = WPM × Accuracy ÷ 100
                </div>
                <div className="text-[9px] text-subtle-gray font-mono">
                  = {item.wpm} × {item.accuracy}% ÷ 100
                </div>
              </div>
            </div>
            <div className="w-16 text-right relative group/wpm">
              <div className="text-xl font-light font-inter text-off-white cursor-help">
                {item.wpm}
              </div>
              <div className="text-[10px] text-subtle-gray uppercase">WPM</div>
              {/* Tooltip for WPM */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/wpm:opacity-100 group-hover/wpm:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <div className="text-[10px] text-off-white font-mono text-center">
                  WPM = (Correct Keys ÷ 5) ÷ Minutes
                </div>
              </div>
            </div>
            <div className="w-16 text-right hidden sm:block">
              <div className="text-sm text-subtle-gray font-mono">{item.accuracy}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }, [rankings, seasonalTheme, rankingsScrollState, handleScroll]);

  return (
    <main className="min-h-screen bg-zen-dark pt-32 pb-16 px-4 md:px-8">
      <div className="noise-overlay" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-subtle-gray text-xs uppercase tracking-[0.4em] mb-2"
            >
              Performance
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-zen-old-mincho text-off-white transition-all duration-1000"
              style={{ textShadow: `0 0 30px ${seasonalTheme.adjustedColors.glow}` }}
            >
              Records
            </motion.h1>
          </div>

          <div className="flex gap-8 border-b border-white/10 pb-1">
            <button
              onClick={() => setTab('history')}
              className={`pb-2 text-sm tracking-widest uppercase transition-colors duration-300 relative ${
                tab === 'history' ? 'text-off-white' : 'text-subtle-gray hover:text-off-white'
              }`}
            >
              History
              {tab === 'history' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
                />
              )}
            </button>
            <button
              onClick={() => setTab('rankings')}
              className={`pb-2 text-sm tracking-widest uppercase transition-colors duration-300 relative ${
                tab === 'rankings' ? 'text-off-white' : 'text-subtle-gray hover:text-off-white'
              }`}
            >
              Leaderboard
              {tab === 'rankings' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
                />
              )}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {tab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {historyContent}
            </motion.div>
          ) : (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex gap-6 justify-end mb-4">
                <CustomSelect
                  value={timeframe}
                  options={[...timeframeOptions]}
                  onChange={(val) => setTimeframe(val)}
                  label="Period"
                />
                <CustomSelect
                  value={limit}
                  options={limitOptions.map((l) => ({ value: l, label: `${l} rows` }))}
                  onChange={(val) => setLimit(val)}
                  label="Show"
                />
              </div>
              {rankingsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zen-dark pt-32 pb-16 px-4 md:px-8">
          <div className="noise-overlay" />
          <div className="max-w-5xl mx-auto">
            <div className="text-center text-subtle-gray">Loading...</div>
          </div>
        </main>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
