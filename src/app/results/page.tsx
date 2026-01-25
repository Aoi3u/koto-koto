'use client';

import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { useThemePalette } from '@/contexts/SeasonalContext';
import CustomSelect from './components/CustomSelect';
import HistoryList from './components/HistoryList';
import HistoryStatsGrid from './components/HistoryStatsGrid';
import HistoryTrendChart from './components/HistoryTrendChart';
import RankingsList from './components/RankingsList';
import { buildHistoryChart, computeHistoryStats } from './utils/history';
import type { HistoryItem, RankingItem } from './types';

const timeframeOptions = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'all', label: 'All time' },
] as const;

const limitOptions = [50, 100, 200];

function ResultsPageContent() {
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const { palette } = useThemePalette('dynamic');
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const historyStats = useMemo(() => computeHistoryStats(history.data), [history.data]);
  const historyChartData = useMemo(() => buildHistoryChart(history.data), [history.data]);

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
      <div className="space-y-8">
        <HistoryStatsGrid stats={historyStats} />
        <HistoryTrendChart data={historyChartData} />
        <HistoryList
          items={history.data}
          scrollRef={historyScrollRef}
          scrollState={historyScrollState}
          onScroll={(e) => handleScroll(e, false)}
        />
      </div>
    );
  }, [history, status, historyScrollState, handleScroll, historyStats, historyChartData]);

  const rankingsContent = useMemo(() => {
    if (rankings.loading) return <div className="text-subtle-gray text-sm py-8">Loading...</div>;
    if (rankings.error)
      return <div className="text-subtle-gray text-sm py-8">{rankings.error}</div>;
    if (rankings.data.length === 0)
      return <div className="text-subtle-gray text-sm py-8">No rankings yet.</div>;

    return (
      <RankingsList
        items={rankings.data}
        scrollRef={rankingsScrollRef}
        scrollState={rankingsScrollState}
        onScroll={(e) => handleScroll(e, true)}
      />
    );
  }, [rankings, rankingsScrollState, handleScroll]);

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
              style={{ textShadow: `0 0 30px ${palette.glow}` }}
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
                  style={{ backgroundColor: palette.primary }}
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
                  style={{ backgroundColor: palette.primary }}
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
