'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import PillActionButton from '@/components/ui/PillActionButton';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import { useThemePalette } from '@/contexts/SeasonalContext';

const authModeOptions: Array<{ value: 'login' | 'register'; label: string }> = [
  { value: 'login', label: 'Login' },
  { value: 'register', label: 'Register' },
];

export default function AuthPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const { palette } = useThemePalette('dynamic');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const fieldBaseClassName =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-off-white placeholder-white/30 focus:outline-none transition-all duration-300 font-zen-old-mincho text-base backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]';

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = palette.primary;
    e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.primary}44, 0 0 22px ${palette.glow}15`;
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 0 rgba(0,0,0,0)';
  };

  const userName = session?.user?.name || 'Guest';
  const userInitials = userName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to register');
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      addToast(mode === 'register' ? 'Welcome, account created' : 'Signed in', 'success');
      router.push('/results');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || updatingName) return;
    setUpdatingName(true);

    try {
      const res = await fetch('/api/user/update-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update name');
      }

      const data = await res.json();

      addToast('Name updated successfully', 'success');
      setIsEditingName(false);
      setNewName('');

      // Update session to reflect the new name
      await update({ user: { name: data.user.name } });
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update name', 'error');
    } finally {
      setUpdatingName(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-y-auto bg-zen-dark px-4 pb-16 pt-24 md:px-8 md:pt-28">
      <div className="noise-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-md space-y-6"
      >
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-subtle-gray transition-colors hover:text-off-white group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs tracking-[0.24em] uppercase font-zen-old-mincho">
              Back to game
            </span>
          </Link>
        </div>

        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-subtle-gray">Account</p>
              <h2 className="mt-1.5 text-xl font-zen-old-mincho text-off-white">
                {status === 'authenticated'
                  ? 'Profile'
                  : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
              </h2>
            </div>
            <div
              className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-subtle-gray"
              style={{ boxShadow: `0 0 16px ${palette.glow}10` }}
            >
              {status === 'authenticated' ? 'Connected' : 'Secure'}
            </div>
          </div>

          <div>
            {status === 'authenticated' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-zen-old-mincho text-off-white"
                    style={{ boxShadow: `0 0 16px ${palette.glow}14` }}
                  >
                    {userInitials || 'K'}
                  </div>

                  <div className="flex-1 space-y-2">
                    {!isEditingName ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-zen-old-mincho text-off-white">
                          {userName}
                        </span>
                        <button
                          onClick={() => {
                            setIsEditingName(true);
                            setNewName(userName);
                          }}
                          className="rounded-full border border-white/10 p-2 text-subtle-gray transition-colors hover:text-off-white"
                          aria-label="Edit name"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          className={fieldBaseClassName}
                          style={{ caretColor: palette.primary }}
                          onFocus={handleFieldFocus}
                          onBlur={handleFieldBlur}
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter new name"
                          autoFocus
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <PillActionButton
                            onClick={handleUpdateName}
                            disabled={updatingName || !newName.trim()}
                            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-off-white transition-all duration-300 hover:bg-white/18"
                            style={{ boxShadow: `0 0 20px ${palette.glow}12` }}
                          >
                            {updatingName ? 'Saving...' : 'Save'}
                          </PillActionButton>
                          <button
                            onClick={() => {
                              setIsEditingName(false);
                              setNewName('');
                            }}
                            disabled={updatingName}
                            className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-subtle-gray transition-colors hover:text-off-white disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs leading-6 text-subtle-gray">{session?.user?.email}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/results"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-off-white transition-all duration-300 hover:bg-white/18"
                    style={{ boxShadow: `0 0 24px ${palette.glow}14` }}
                  >
                    View results
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.24em] text-subtle-gray transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                  >
                    Sign out
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <UnderlineTabs
                    ariaLabel="Switch authentication mode"
                    value={mode}
                    options={authModeOptions}
                    onChange={setMode}
                    className="inline-flex gap-8 border-b border-white/10 pb-1"
                    itemClassName="relative pb-2 text-xs uppercase tracking-[0.24em] transition-colors duration-300"
                    activeItemClassName="text-off-white"
                    inactiveItemClassName="text-subtle-gray hover:text-off-white"
                    indicatorClassName="absolute bottom-0 left-0 right-0 h-0.5"
                    indicatorColor={palette.primary}
                    layoutId="auth-mode-tab-indicator"
                  />
                </div>

                <motion.p
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-[11px] uppercase tracking-[0.16em] text-subtle-gray"
                >
                  {mode === 'login'
                    ? 'Welcome back. Your results are waiting.'
                    : 'Create a profile and start with a clean slate.'}
                </motion.p>

                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.28em] text-subtle-gray">
                          Display name
                        </label>
                        <input
                          className={fieldBaseClassName}
                          style={{ caretColor: palette.primary }}
                          onFocus={handleFieldFocus}
                          onBlur={handleFieldBlur}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name"
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.28em] text-subtle-gray">
                    Email
                  </label>
                  <input
                    className={fieldBaseClassName}
                    style={{ caretColor: palette.primary }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.28em] text-subtle-gray">
                    Password
                  </label>
                  <input
                    className={fieldBaseClassName}
                    style={{ caretColor: palette.primary }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                  />
                </div>

                <div className="pt-2 flex flex-col items-center gap-4">
                  <PillActionButton
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full border border-white/18 bg-white/10 px-6 py-3.5 text-sm uppercase tracking-[0.2em] text-off-white transition-all duration-300 hover:bg-white/18"
                    style={{
                      boxShadow: `0 0 28px ${palette.glow}22`,
                    }}
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Enter' : 'Join'}
                  </PillActionButton>

                  <div className="relative w-full py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-zen-dark px-3 text-[10px] uppercase tracking-[0.28em] text-subtle-gray font-zen-old-mincho">
                        or
                      </span>
                    </div>
                  </div>

                  <PillActionButton
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/results' })}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-xs uppercase tracking-[0.18em] text-off-white transition-all duration-300 hover:bg-white/12"
                    style={{ boxShadow: `0 0 20px ${palette.glow}10` }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </PillActionButton>

                  <p className="max-w-sm text-center text-[10px] uppercase tracking-[0.24em] text-subtle-gray">
                    Secure sign-in powered by NextAuth
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </motion.div>
    </main>
  );
}
