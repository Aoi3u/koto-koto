'use client';

import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import { useThemePalette } from '@/contexts/SeasonalContext';
import CustomSelect from './components/CustomSelect';
import HistoryList from './components/HistoryList';
import HistoryStatsGrid from './components/HistoryStatsGrid';
import HistoryTrendChart from './components/HistoryTrendChart';
import RankingsList from './components/RankingsList';
import { buildHistoryChart, computeHistoryStats } from './utils/history';
import type { ChapterMeta, HistoryItem, RankingItem } from './types';

// Matches the server-side DISPLAY_LIMIT in /api/game-results.
const HISTORY_DISPLAY_LIMIT = 100;

const timeframeOptions = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'all', label: 'All time' },
] as const;

const limitOptions = [50, 100, 200];
const rankingModeOptions: Array<{ value: 'users' | 'runs'; label: string }> = [
  { value: 'users', label: 'Players' },
  { value: 'runs', label: 'Runs' },
];
const recordTabOptions: Array<{ value: 'history' | 'rankings'; label: string }> = [
  { value: 'history', label: 'History' },
  { value: 'rankings', label: 'Leaderboard' },
];

function ResultsPageContent() {
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const { palette } = useThemePalette('dynamic');
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<'history' | 'rankings'>('history');
  const [rankingMode, setRankingMode] = useState<'runs' | 'users'>('users');

  // Data states
  const [history, setHistory] = useState<{
    loading: boolean;
    error: string | null;
    data: HistoryItem[];
    allData: HistoryItem[];
  }>({ loading: false, error: null, data: [], allData: [] });
  const [rankings, setRankings] = useState<{
    loading: boolean;
    error: string | null;
    data: RankingItem[];
  }>({ loading: false, error: null, data: [] });

  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month' | 'day'>('all');
  const [limit, setLimit] = useState<number>(50);

  // Chapter metadata (for both tabs' chapter selectors) and each tab's own
  // filter state. History defaults to "all chapters" to preserve today's
  // behavior; Rankings defaults to the current chapter once it's known, so
  // a pool renewal doesn't leave a retired chapter's scores permanently
  // sitting atop the board.
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);
  const [historyChapterFilter, setHistoryChapterFilter] = useState<'all' | string>('all');
  const [rankingsChapterFilter, setRankingsChapterFilter] = useState<'all' | string>('all');
  const rankingsChapterInitialized = useRef(false);

  // Client-side cache of rankings responses keyed by mode/timeframe/limit, so
  // switching back to a filter combination already seen this session shows
  // results instantly instead of a "Loading..." flash, while still
  // revalidating in the background to keep the board fresh.
  const rankingsCacheRef = useRef<Map<string, RankingItem[]>>(new Map());
  const rankingsRequestIdRef = useRef(0);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/chapters', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const body = await res.json();
        const list: ChapterMeta[] = body.chapters ?? [];
        if (cancelled) return;
        setChapters(list);

        if (!rankingsChapterInitialized.current) {
          const current = list.find((c) => c.isCurrent);
          if (current) {
            rankingsChapterInitialized.current = true;
            setRankingsChapterFilter(String(current.number));
          }
        }
      } catch {
        // Chapter selector is a progressive enhancement; silently keep the
        // "all" defaults if the list can't be loaded.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    setHistory((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/game-results', { cache: 'no-store' });
      if (res.status === 401) {
        setHistory({
          loading: false,
          error: 'Sign in to view your history.',
          data: [],
          allData: [],
        });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch history');
      const body = await res.json();
      setHistory({
        loading: false,
        error: null,
        data: body.results ?? [],
        allData: body.allResults ?? [],
      });
    } catch {
      setHistory({ loading: false, error: 'Failed to load history', data: [], allData: [] });
      addToast('Failed to load history', 'error');
    }
  }, [session?.user, addToast]);

  const fetchRankings = useCallback(async () => {
    const cacheKey = `${rankingMode}:${timeframe}:${rankingsChapterFilter}:${limit}`;
    const cached = rankingsCacheRef.current.get(cacheKey);
    const requestId = ++rankingsRequestIdRef.current;

    if (cached) {
      // Show the cached view immediately; still revalidate below.
      setRankings({ loading: false, error: null, data: cached });
    } else {
      setRankings((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const params = new URLSearchParams({
        timeframe,
        limit: String(limit),
        mode: rankingMode,
        chapter: rankingsChapterFilter,
      });
      const res = await fetch(`/api/rankings?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch rankings');
      const body = await res.json();
      if (requestId !== rankingsRequestIdRef.current) return; // superseded by a newer request

      const data: RankingItem[] = body.results ?? [];
      rankingsCacheRef.current.set(cacheKey, data);
      setRankings({ loading: false, error: null, data });
    } catch {
      if (requestId !== rankingsRequestIdRef.current) return;

      // If we already have a cached view on screen, keep it and fail
      // silently in the background rather than replacing it with an error.
      if (cached) return;

      setRankings({ loading: false, error: 'Failed to load rankings', data: [] });
      addToast('Failed to load rankings', 'error');
    }
  }, [timeframe, limit, rankingMode, rankingsChapterFilter, addToast]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, fetchHistory]);

  useEffect(() => {
    if (tab !== 'rankings') return;
    fetchRankings();
  }, [tab, fetchRankings]);

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

  // history.data is already capped to the most recent HISTORY_DISPLAY_LIMIT
  // entries server-side; that cap is taken *before* any chapter filtering,
  // so filtering it directly would under-populate an older chapter's view
  // (its entries may not be among the overall most-recent ones). Filter the
  // full history.allData instead, then re-apply the same display cap.
  const filteredHistoryAllData = useMemo(() => {
    if (historyChapterFilter === 'all') return history.allData;
    const chapterNumber = Number(historyChapterFilter);
    return history.allData.filter((item) => item.chapterNumber === chapterNumber);
  }, [history.allData, historyChapterFilter]);

  const filteredHistoryDisplayData = useMemo(
    () =>
      historyChapterFilter === 'all'
        ? history.data
        : filteredHistoryAllData.slice(0, HISTORY_DISPLAY_LIMIT),
    [historyChapterFilter, history.data, filteredHistoryAllData]
  );

  const historyStats = useMemo(
    () => computeHistoryStats(filteredHistoryAllData),
    [filteredHistoryAllData]
  );
  const historyChartData = useMemo(
    () => buildHistoryChart(filteredHistoryAllData),
    [filteredHistoryAllData]
  );

  const chapterOptions = useMemo(
    () => [
      { value: 'all', label: 'All chapters' },
      ...chapters.map((c) => ({
        value: String(c.number),
        label: `Chapter ${c.number}${c.isCurrent ? ' (current)' : ''}`,
      })),
    ],
    [chapters]
  );

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
    if (filteredHistoryDisplayData.length === 0)
      return <div className="text-subtle-gray text-sm py-8">No results yet.</div>;

    return (
      <div className="space-y-8">
        <HistoryStatsGrid stats={historyStats} />
        <HistoryTrendChart data={historyChartData} />
        <HistoryList
          items={filteredHistoryDisplayData}
          showChapterBadge={historyChapterFilter === 'all'}
          scrollRef={historyScrollRef}
          scrollState={historyScrollState}
          onScroll={(e) => handleScroll(e, false)}
        />
      </div>
    );
  }, [
    history.loading,
    history.error,
    status,
    historyScrollState,
    handleScroll,
    historyStats,
    historyChartData,
    filteredHistoryDisplayData,
    historyChapterFilter,
  ]);

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

          <UnderlineTabs
            ariaLabel="Switch records tab"
            value={tab}
            options={recordTabOptions}
            onChange={setTab}
            className="flex gap-8 border-b border-white/10 pb-1"
            itemClassName="pb-2 text-sm tracking-widest uppercase transition-colors duration-300 relative"
            activeItemClassName="text-off-white"
            inactiveItemClassName="text-subtle-gray hover:text-off-white"
            indicatorClassName="absolute bottom-0 left-0 right-0 h-0.5"
            indicatorColor={palette.primary}
            layoutId="tab-indicator"
          />
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
              {chapters.length > 0 && (
                <div className="flex justify-end mb-4">
                  <CustomSelect
                    value={historyChapterFilter}
                    options={chapterOptions}
                    onChange={setHistoryChapterFilter}
                    label="Chapter"
                  />
                </div>
              )}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <UnderlineTabs
                  ariaLabel="Switch leaderboard type"
                  value={rankingMode}
                  options={rankingModeOptions}
                  onChange={setRankingMode}
                  className="inline-flex gap-8 border-b border-white/10 pb-1"
                  itemClassName="pb-2 text-xs tracking-[0.2em] uppercase transition-colors duration-300 relative"
                  activeItemClassName="text-off-white"
                  inactiveItemClassName="text-subtle-gray hover:text-off-white"
                  indicatorClassName="absolute bottom-0 left-0 right-0 h-0.5"
                  indicatorColor={palette.primary}
                  layoutId="ranking-mode-tab-indicator"
                />
                <div className="flex gap-6 justify-end">
                  {chapters.length > 0 && (
                    <CustomSelect
                      value={rankingsChapterFilter}
                      options={chapterOptions}
                      onChange={setRankingsChapterFilter}
                      label="Chapter"
                    />
                  )}
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
