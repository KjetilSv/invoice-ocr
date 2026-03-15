'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminPassword, isAdminAuthed } from '@/lib/adminAuth';
import { loadAdminPrefs, saveAdminPrefs, type AdminPrefs } from '@/lib/adminPrefs';

export default function AdminPage() {
  const [prefs, setPrefs] = useState<AdminPrefs>({
    aiEnabled: false,
    useLocalApi: false,
    localApiUrl: '',
    localApiKey: '',
    donateSol: '',
    donateAvax: '',
    donateDfk: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const pw = getAdminPassword();
    if (pw && !isAdminAuthed()) {
      window.location.href = '/admin/login';
      return;
    }

    setPrefs(loadAdminPrefs());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveAdminPrefs(prefs);
  }, [mounted, prefs]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-gray-600">Local settings stored in this browser (localStorage).</p>
          </div>
          <Link className="text-sm underline text-indigo-700" href="/app">
            ← Back to app
          </Link>
        </div>

        <div className="mt-6 p-5 rounded-xl border bg-white shadow-sm">
          <h2 className="font-semibold">AI mode</h2>
          <p className="mt-1 text-sm text-gray-600">
            Toggles whether the <b>Run (AI)</b> button is shown in the app. (Server still needs{' '}
            <code>OPENROUTER_API_KEY</code> to actually work.)
          </p>

          <label className="mt-3 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={prefs.aiEnabled}
              onChange={(e) => setPrefs((p) => ({ ...p, aiEnabled: e.target.checked }))}
            />
            Enable AI button
          </label>
        </div>

        <div className="mt-4 p-5 rounded-xl border bg-white shadow-sm">
          <h2 className="font-semibold">Local API (tunnel)</h2>
          <p className="mt-1 text-sm text-gray-600">
            If enabled, the main <b>Run</b> button uses your local tunnel API (free). Example URL:{' '}
            <code>https://xxxx.trycloudflare.com</code>
          </p>

          <label className="mt-3 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={prefs.useLocalApi}
              onChange={(e) => setPrefs((p) => ({ ...p, useLocalApi: e.target.checked }))}
            />
            Use Local API for scans
          </label>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">API URL</span>
              <input
                className="border rounded-lg px-3 py-2"
                value={prefs.localApiUrl}
                onChange={(e) => setPrefs((p) => ({ ...p, localApiUrl: e.target.value }))}
                placeholder="https://xxxx.trycloudflare.com"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">API key</span>
              <input
                className="border rounded-lg px-3 py-2"
                value={prefs.localApiKey}
                onChange={(e) => setPrefs((p) => ({ ...p, localApiKey: e.target.value }))}
                placeholder="ioc_…"
              />
            </label>

            <div className="text-xs text-gray-500">
              Tip: if URL changes (quick tunnel), paste the new URL here.
            </div>
          </div>
        </div>

        <div className="mt-4 p-5 rounded-xl border bg-white shadow-sm">
          <h2 className="font-semibold">Donation addresses</h2>
          <p className="mt-1 text-sm text-gray-600">Shown/used by the donate section in the app.</p>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">Solana address</span>
              <input
                className="border rounded-lg px-3 py-2"
                value={prefs.donateSol}
                onChange={(e) => setPrefs((p) => ({ ...p, donateSol: e.target.value }))}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">AVAX address</span>
              <input
                className="border rounded-lg px-3 py-2"
                value={prefs.donateAvax}
                onChange={(e) => setPrefs((p) => ({ ...p, donateAvax: e.target.value }))}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">DFK Chain address</span>
              <input
                className="border rounded-lg px-3 py-2"
                value={prefs.donateDfk}
                onChange={(e) => setPrefs((p) => ({ ...p, donateDfk: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <Link className="underline" href="/privacy">
            Privacy
          </Link>
          <span> • </span>
          <Link className="underline" href="/about">
            About
          </Link>
        </div>
      </div>
    </main>
  );
}
