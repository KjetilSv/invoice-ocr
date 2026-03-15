'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminPassword, setAdminAuthed } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [hasPw, setHasPw] = useState(false);

  useEffect(() => {
    setHasPw(Boolean(getAdminPassword()));
  }, []);

  function submit() {
    const expected = getAdminPassword();
    if (!expected) {
      setMsg('Admin password is not configured. Set NEXT_PUBLIC_ADMIN_PASSWORD.');
      return;
    }
    if (pw === expected) {
      setAdminAuthed(true);
      window.location.href = '/admin';
      return;
    }
    setMsg('Wrong password');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-2 text-sm text-gray-600">
          This page is protected by <code>NEXT_PUBLIC_ADMIN_PASSWORD</code>.
        </p>

        <div className="mt-5 p-5 rounded-xl border bg-white shadow-sm">
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">Password</span>
            <input
              className="border rounded-lg px-3 py-2"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
              autoComplete="current-password"
              disabled={!hasPw}
            />
          </label>

          <button
            className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            onClick={submit}
            disabled={!hasPw}
            type="button"
          >
            Log in
          </button>

          {msg ? <div className="mt-3 text-sm text-red-700">{msg}</div> : null}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <Link className="underline" href="/app">
            ← Back to app
          </Link>
        </div>
      </div>
    </main>
  );
}
