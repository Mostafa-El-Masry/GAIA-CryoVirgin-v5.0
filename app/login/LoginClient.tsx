'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const LOCAL_CURRENT_USER_ID_KEY = 'gaia_current_user_id_v1';

type Mode = 'signin' | 'signup';

interface LoginClientProps {
  className?: string;
  initialMode?: Mode;
}

// GAIA Level 3 Multi-user & Permissions
// Version 4.3 Auth with email verify + name
// Phone-first UI wrapper
const LoginClient: React.FC<LoginClientProps> = ({
  className = '',
  initialMode = 'signin',
}) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [mode, setMode] = useState<Mode>(initialMode);

  // Keep local mode in sync with route query (?mode=)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        throw signInError;
      }

      // Extra gate: make sure email is confirmed.
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      const user = userData?.user ?? null;

      const confirmedAt = (user as any)?.email_confirmed_at;
      if (!confirmedAt) {
        await supabase.auth.signOut();
        setError(
          'Your email is not verified yet. Please check your inbox for a verification email, confirm it, and then sign in again.'
        );
        return;
      }

      // Allow auth state to sync before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use replace instead of push for mobile compatibility
      router.replace('/');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });
      if (signUpError) {
        throw signUpError;
      }

      // Best-effort: keep GAIA internal users table in sync.
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: name.trim(),
            email: email.trim(),
            role: 'member',
            permissions: {
              canViewGalleryPrivate: true,
              canViewWealth: true,
              canViewHealth: true,
              canViewGuardian: true,
            },
          }),
        });
      } catch {
        // ignore
      }

      if (data?.user?.id) {
        setInfo(
          'Account created. Please check your email for a verification link before signing in.'
        );
      } else {
        setInfo(
          'Sign-up request sent. If email confirmation is enabled, you should receive an email shortly.'
        );
      }
      setMode('signin');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Guest',
          email: null,
          role: 'guest',
          permissions: {
            canViewGalleryPrivate: false,
            canViewWealth: false,
            canViewHealth: false,
            canViewGuardian: false,
          },
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (!data.ok || !data.user) {
        throw new Error(data.error || 'Failed to create guest user.');
      }

      const guestId = String(data.user.id);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCAL_CURRENT_USER_ID_KEY, guestId);
        }
      } catch {
        // ignore
      }

      // Allow state to sync before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to continue as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(52,211,153,0.16),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(52,211,153,0.12),transparent_45%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <img src="/gaia-intro-1.png" alt="GAIA" className="h-9 w-auto" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                GAIA
              </p>
              <p className="text-lg font-semibold leading-5 text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </p>
              <p className="text-sm text-white/70">Phone-friendly auth panel.</p>
            </div>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-white/15">
            {mode === 'signin' ? 'Returning' : 'New member'}
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {mode === 'signin'
                  ? 'Sign in to continue your journey.'
                  : 'Create a new GAIA seat.'}
              </p>
              <p className="text-sm text-white/70">
                Minimal taps, clear labels, thumb-friendly fields.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 p-1 ring-1 ring-emerald-400/40">
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('signin');
                }}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-emerald-500 text-emerald-950 shadow-sm shadow-emerald-500/50'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('signup');
                }}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-emerald-500 text-emerald-950 shadow-sm shadow-emerald-500/50'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                Create
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
              {info}
            </p>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-white/80">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 px-4 py-3 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-white/80">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-white/80">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-white/80">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="gaia-glass gaia-border w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-white outline-none ring-emerald-400/30 focus:border-emerald-300 focus:ring-2"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 px-4 py-3 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <div className="mt-5 space-y-3 text-center text-sm text-white/70">
            {mode === 'signin' ? (
              <p>
                Do not have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('signup');
                  }}
                  className="font-semibold text-emerald-200 hover:text-white"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('signin');
                  }}
                  className="font-semibold text-emerald-200 hover:text-white"
                >
                  Sign in
                </button>
              </p>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-inner shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Continue as guest
                  </p>
                  <p className="text-xs text-white/60">
                    Preview the intro only. Locked areas stay restricted.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  disabled={loading}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:border-emerald-300/40 hover:text-emerald-50 disabled:opacity-60"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginClient;
