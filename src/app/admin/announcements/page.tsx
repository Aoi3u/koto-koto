'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import BackNavLink from '@/components/ui/BackNavLink';
import PillActionButton from '@/components/ui/PillActionButton';
import { useThemePalette } from '@/contexts/SeasonalContext';

interface SentAnnouncement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

type AccessState = 'checking' | 'denied' | 'granted';

const fieldBaseClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-off-white placeholder-white/30 focus:outline-none transition-all duration-300 font-zen-old-mincho text-base backdrop-blur-sm';

export default function AdminAnnouncementsPage() {
  const { status } = useSession();
  const { palette } = useThemePalette('dynamic');
  const { addToast } = useToast();

  const [access, setAccess] = useState<AccessState>('checking');
  const [sent, setSent] = useState<SentAnnouncement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      setAccess('denied');
      return;
    }

    let cancelled = false;

    fetch('/api/admin/announcements')
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAccess('denied');
          return;
        }
        const data = await res.json();
        setSent(data.announcements);
        setAccess('granted');
      })
      .catch(() => {
        if (!cancelled) setAccess('denied');
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleFieldFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.currentTarget.style.borderColor = palette.primary;
    e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.primary}44, 0 0 22px ${palette.glow}15`;
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !title.trim() || !body.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send announcement');
      }

      const data = await res.json();
      setSent((prev) => [data.announcement, ...prev]);
      setTitle('');
      setBody('');
      addToast('Announcement sent', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to send announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-y-auto bg-zen-dark px-4 pb-16 pt-24 md:px-8 md:pt-28">
      <div className="noise-overlay" />
      <BackNavLink href="/" label="Back to game" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-xl space-y-8"
      >
        <div className="border-b border-white/10 pb-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-subtle-gray">Admin</p>
          <h2 className="mt-1.5 text-xl font-zen-old-mincho text-off-white">Send an announcement</h2>
        </div>

        {access === 'checking' ? (
          <p className="py-16 text-center text-sm text-subtle-gray">Loading...</p>
        ) : access === 'denied' ? (
          <p className="py-16 text-center text-sm text-subtle-gray font-zen-old-mincho">
            Access denied.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.28em] text-subtle-gray">
                  Title
                </label>
                <input
                  className={fieldBaseClassName}
                  onFocus={handleFieldFocus}
                  onBlur={handleFieldBlur}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.28em] text-subtle-gray">
                  Body
                </label>
                <textarea
                  className={`${fieldBaseClassName} min-h-32 resize-y`}
                  onFocus={handleFieldFocus}
                  onBlur={handleFieldBlur}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Message body"
                  maxLength={4000}
                  required
                />
              </div>

              <PillActionButton
                type="submit"
                disabled={submitting || !title.trim() || !body.trim()}
                className="rounded-full border border-white/18 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-off-white transition-all duration-300 hover:bg-white/18"
                style={{ boxShadow: `0 0 24px ${palette.glow}18` }}
              >
                {submitting ? 'Sending...' : 'Send'}
              </PillActionButton>
            </form>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-subtle-gray">
                Previously sent
              </p>
              {sent.length === 0 ? (
                <p className="py-8 text-center text-sm text-subtle-gray">Nothing sent yet.</p>
              ) : (
                <ul>
                  {sent.map((a) => (
                    <li key={a.id} className="border-b border-white/10 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate font-zen-old-mincho text-off-white">
                          {a.title}
                        </span>
                        <time className="shrink-0 text-[11px] text-subtle-gray">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
