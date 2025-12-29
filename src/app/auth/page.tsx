'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { useSeasonalTheme } from '@/contexts/SeasonalContext';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const seasonalTheme = useSeasonalTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setMode((m) => (m === 'login' ? 'register' : 'login'));

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

  return (
    <main className="min-h-screen bg-zen-dark flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="noise-overlay" />

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: seasonalTheme.adjustedColors.secondary }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-12">
          <p className="text-subtle-gray text-xs uppercase tracking-[0.4em] mb-4">Authentication</p>
          <h1
            className="text-4xl md:text-5xl font-zen-old-mincho text-off-white tracking-wide transition-all duration-1000"
            style={{ textShadow: `0 0 30px ${seasonalTheme.adjustedColors.glow}` }}
          >
            Koto-Koto
          </h1>
        </div>

        {status === 'authenticated' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-off-white/80 font-zen-old-mincho">
              Signed in as{' '}
              <span style={{ color: seasonalTheme.adjustedColors.primary }}>
                {session?.user?.email ?? session?.user?.name}
              </span>
            </div>
            <div className="flex justify-center gap-6 text-sm font-zen-old-mincho tracking-widest">
              <Link
                href="/results"
                className="text-off-white hover:opacity-80 transition-opacity"
                style={{ textShadow: `0 0 10px ${seasonalTheme.adjustedColors.glow}` }}
              >
                RESULTS
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-subtle-gray hover:text-off-white transition-colors"
              >
                SIGN OUT
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    className="w-full bg-transparent border-b border-white/20 py-2 text-off-white placeholder-white/20 focus:outline-none transition-colors font-zen-old-mincho text-lg text-center"
                    style={{ caretColor: seasonalTheme.adjustedColors.primary }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = seasonalTheme.adjustedColors.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <input
                className="w-full bg-transparent border-b border-white/20 py-2 text-off-white placeholder-white/20 focus:outline-none transition-colors font-zen-old-mincho text-lg text-center"
                style={{ caretColor: seasonalTheme.adjustedColors.primary }}
                onFocus={(e) => (e.target.style.borderColor = seasonalTheme.adjustedColors.primary)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <input
                className="w-full bg-transparent border-b border-white/20 py-2 text-off-white placeholder-white/20 focus:outline-none transition-colors font-zen-old-mincho text-lg text-center"
                style={{ caretColor: seasonalTheme.adjustedColors.primary }}
                onFocus={(e) => (e.target.style.borderColor = seasonalTheme.adjustedColors.primary)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-off-white font-zen-old-mincho tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                style={{
                  boxShadow: `0 0 20px ${seasonalTheme.adjustedColors.glow}20`,
                }}
              >
                {loading ? 'PROCESSING...' : mode === 'login' ? 'ENTER' : 'JOIN'}
              </button>

              <button
                type="button"
                onClick={toggleMode}
                className="text-xs text-subtle-gray hover:text-off-white transition-colors tracking-wider font-zen-old-mincho"
              >
                {mode === 'login' ? 'Create an account' : 'Already have an account?'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
