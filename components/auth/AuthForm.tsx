'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/auth/${mode}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      // Full navigation so the navbar and server pages pick up the new session.
      window.location.href = data.user.role === 'admin' ? '/admin' : '/account';
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const input =
    'mt-2 block w-full border border-char-950/15 bg-white px-4 py-3.5 text-[0.95rem] text-char-950 outline-none transition focus:border-char-950';
  const label = 'block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-char-700';

  return (
    <section className="min-h-screen bg-warm-50 px-gutter pb-24 pt-36">
      <div className="mx-auto w-full max-w-md border border-char-950/10 bg-warm-white p-8 sm:p-10">
        <p className="eyebrow">{isSignup ? 'Create an account' : 'Welcome back'}</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-char-950">
          {isSignup ? 'Sign up' : 'Log in'}
        </h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          {isSignup && (
            <label className={label}>
              Full name
              <input name="name" autoComplete="name" required className={input} />
            </label>
          )}
          <label className={label}>
            Email
            <input name="email" type="email" autoComplete="email" required className={input} />
          </label>
          <label className={label}>
            Password
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 8 : undefined}
              required
              className={input}
            />
            {isSignup && <span className="mt-1.5 block text-xs normal-case tracking-normal text-stone-500">At least 8 characters.</span>}
          </label>

          {error && (
            <p role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-solid w-full disabled:opacity-60">
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-8 text-sm text-stone-600">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <Link href={isSignup ? '/login' : '/signup'} className="link-draw font-semibold text-char-950">
            {isSignup ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </section>
  );
}
