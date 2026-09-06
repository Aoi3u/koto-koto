'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import BackNavLink from '@/components/ui/BackNavLink';
import { useThemePalette } from '@/contexts/SeasonalContext';
import type { Announcement } from '@/types/announcement';

export default function InboxPage() {
  const { status } = useSession();
  const { palette } = useThemePalette('dynamic');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled) setAnnouncements(data.announcements);
      } catch {
        if (!cancelled) setError('Failed to load messages.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleToggle = useCallback(
    (id: string) => {
      setOpenId((current) => (current === id ? null : id));

      const target = announcements.find((a) => a.id === id);
      if (target && !target.isRead) {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
        fetch(`/api/announcements/${id}/read`, { method: 'POST' }).catch(() => {});
      }
    },
    [announcements]
  );

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <main className="relative min-h-screen overflow-y-auto bg-zen-dark px-4 pb-16 pt-24 md:px-8 md:pt-28">
      <div className="noise-overlay" />
      <BackNavLink href="/" label="Back to game" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-xl space-y-6"
      >
        <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-subtle-gray">Inbox</p>
            <h2 className="mt-1.5 text-xl font-zen-old-mincho text-off-white">Messages</h2>
          </div>
          {unreadCount > 0 && (
            <span className="text-[11px] text-subtle-gray">{unreadCount} unread</span>
          )}
        </div>

        {status !== 'authenticated' ? (
          <p className="py-16 text-center text-sm text-subtle-gray font-zen-old-mincho">
            Sign in to view messages from the team.
          </p>
        ) : loading ? (
          <p className="py-16 text-center text-sm text-subtle-gray">Loading...</p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-subtle-gray">{error}</p>
        ) : announcements.length === 0 ? (
          <p className="py-16 text-center text-sm text-subtle-gray">No messages yet.</p>
        ) : (
          <ul>
            {announcements.map((a) => {
              const isOpen = openId === a.id;
              return (
                <li key={a.id} className="border-b border-white/10">
                  <button
                    onClick={() => handleToggle(a.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 py-4 text-left"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: a.isRead ? 'transparent' : palette.primary }}
                    />
                    <span
                      className={`min-w-0 flex-1 truncate font-zen-old-mincho ${
                        a.isRead ? 'text-subtle-gray' : 'text-off-white'
                      }`}
                    >
                      {a.title}
                    </span>
                    <time className="shrink-0 text-[11px] text-subtle-gray">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </time>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="whitespace-pre-wrap py-1 pb-4 pl-4.5 text-sm leading-6 text-subtle-gray">
                          {a.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </main>
  );
}
