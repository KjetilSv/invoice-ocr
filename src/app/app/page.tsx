'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { addBonus, applyDonate, canScan, consumeOne, loadQuota, saveQuota, type QuotaState } from '@/lib/quota';
import { loadPrefs, savePrefs, type Prefs } from '@/lib/prefs';
import { loadLocalApiPrefs, saveLocalApiPrefs, type LocalApiPrefs } from '@/lib/localApiPrefs';
import { parseFromText, type Parsed } from '@/lib/parse';
import {
  addUsedTxid,
  isTxidUsed,
  loadDonations,
  saveDonations,
  type DonateChain,
  type DonationRecord,
} from '@/lib/donations';


type Resp =
  | { ok: true; parsed: Parsed; rawText: string; mode: 'openrouter' | 'browser-ocr' | 'local-api' }
  | { ok: false; message: string };


async function downscaleToJpeg(file: File, maxW = 1600): Promise<File> {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Failed to load image'));
  });

  const scale = Math.min(1, maxW / (img.naturalWidth || maxW));
  const w = Math.max(1, Math.round((img.naturalWidth || maxW) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || maxW) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  URL.revokeObjectURL(img.src);
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, '') + '.jpg', { type: 'image/jpeg' });
}

export default function Home() {
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<Resp | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({ preset: 'auto', lang: 'auto' });
  const [localApi, setLocalApi] = useState<LocalApiPrefs>({ url: '', key: '' });
  const [donations, setDonations] = useState<DonationRecord | null>(null);
  const [donateChain, setDonateChain] = useState<DonateChain>('avax');
  const [donateTxid, setDonateTxid] = useState('');

  const uiLang = useMemo(() => {
    if (prefs.lang === 'no' || prefs.lang === 'en') return prefs.lang;
    const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    return nav.toLowerCase().startsWith('no') || nav.toLowerCase().startsWith('nb') || nav.toLowerCase().startsWith('nn')
      ? 'no'
      : 'en';
  }, [prefs.lang]);

  const t = useMemo(() => {
    const no = {
      chooseImage: 'Velg bilde',
      title: 'Invoice OCR',
      tagline: 'Super enkel: ta bilde / last opp → copy betalingsfelt. Vi lagrer ingenting (MVP).',
      startCamera: 'Start kamera',
      stopCamera: 'Stopp kamera',
      capture: 'Ta bilde',
      noFile: 'Ingen fil valgt',
      runAI: 'Kjør (AI)',
      runFree: 'Kjør (gratis OCR)',
      running: 'Kjører…',
      scansLeft: 'Scans igjen i dag',
      donatedToday: 'Donert i dag (+10 aktivert)',
      iDonated: 'Jeg donerte (+10 scans)',
      preset: 'Preset',
      language: 'Språk',
      saved: '(lagres i denne browseren)',
      mode: 'Mode',
      detected: 'detected',
      copyKID: 'Kopier KID',
      copyKonto: 'Kopier konto',
      copyIBAN: 'Kopier IBAN',
      copyAmount: 'Kopier beløp',
      copyDue: 'Kopier forfall',
      rawText: 'Raw text',
      scansNone: 'Ingen scans igjen i dag. Doner for +10 scans.',
      donateCryptoTitle: 'Doner med crypto (MVP)',
      localApiTitle: 'Local API (gratis, via tunnel)',
      localApiUrl: 'API URL',
      localApiKey: 'API key',
      runLocal: 'Kjør (Local API)',
      donateChain: 'Chain',
      donateAddress: 'Adresse',
      copyAddress: 'Kopier adresse',
      txid: 'Txid',
      applyTxid: 'Gi meg +10 scans',
      txidUsed: 'Denne txid-en er allerede brukt (siste 30 dager).',
      txidMissing: 'Lim inn txid først.',
      donateNote:
        'Dette er MVP: vi verifiserer ikke on-chain ennå. Vi bruker txid som en enkel “kupong” og blokkerer gjenbruk i 30 dager.',
      added10: '+10 scans lagt til',
    };
    const en = {
      chooseImage: 'Choose image',
      title: 'Invoice OCR',
      tagline: "Super simple: take a photo / upload → copy payment fields. We don't store anything (MVP).",
      startCamera: 'Start camera',
      stopCamera: 'Stop camera',
      capture: 'Capture',
      noFile: 'No file selected',
      runAI: 'Run (AI)',
      runFree: 'Run (free OCR)',
      running: 'Running…',
      scansLeft: 'Scans left today',
      donatedToday: 'Donated today (+10 applied)',
      iDonated: 'I donated (+10 scans)',
      preset: 'Preset',
      language: 'Language',
      saved: '(saved in this browser)',
      mode: 'Mode',
      detected: 'detected',
      copyKID: 'Copy KID',
      copyKonto: 'Copy account',
      copyIBAN: 'Copy IBAN',
      copyAmount: 'Copy amount',
      copyDue: 'Copy due date',
      rawText: 'Raw text',
      scansNone: 'No scans left today. Donate to get +10 scans.',
      donateCryptoTitle: 'Donate with crypto (MVP)',
      localApiTitle: 'Local API (free, via tunnel)',
      localApiUrl: 'API URL',
      localApiKey: 'API key',
      runLocal: 'Run (Local API)',
      donateChain: 'Chain',
      donateAddress: 'Address',
      copyAddress: 'Copy address',
      txid: 'Txid',
      applyTxid: 'Give me +10 scans',
      txidUsed: 'This txid was already used (last 30 days).',
      txidMissing: 'Paste a txid first.',
      donateNote:
        "MVP: we don't verify on-chain yet. We use the txid as a simple coupon and block re-use for 30 days.",
      added10: '+10 scans added',
    };
    return uiLang === 'no' ? no : en;
  }, [uiLang]);

  // Camera (preview) – only secure contexts
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [canUseCamera, setCanUseCamera] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuota(loadQuota());
    setPrefs(loadPrefs());
    setLocalApi(loadLocalApiPrefs());
    setDonations(loadDonations());
    // Camera preview requires secure context (https/localhost) and getUserMedia.
    setCanUseCamera(Boolean((window as any).isSecureContext && navigator.mediaDevices?.getUserMedia));
  }, []);

  useEffect(() => {
    if (!quota) return;
    saveQuota(quota);
  }, [quota]);

  useEffect(() => {
    if (!mounted) return;
    savePrefs(prefs);
  }, [mounted, prefs]);

  useEffect(() => {
    if (!mounted) return;
    saveLocalApiPrefs(localApi);
  }, [mounted, localApi]);

  useEffect(() => {
    if (!mounted || !donations) return;
    saveDonations(donations);
  }, [mounted, donations]);

  useEffect(() => {
    return () => {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
    };
  }, []);

  async function startCamera() {
    if (!canUseCamera) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setCameraOn(true);
  }

  function stopCamera() {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  async function capturePhoto() {
    const v = videoRef.current;
    if (!v) return;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return;
    setFile(new File([blob], `invoice-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    setResp(null);
  }

  async function runOpenRouter() {
    if (!file || !quota) return;
    if (!canScan(quota)) {
      setResp({ ok: false, message: t.scansNone });
      return;
    }

    setLoading(true);
    setResp(null);
    try {
      const scaled = await downscaleToJpeg(file, 1600);
      const fd = new FormData();
      fd.append('file', scaled);
      fd.append('preset', prefs.preset);
      fd.append('lang', prefs.lang);

      const r = await fetch('/api/scan', { method: 'POST', body: fd });
      const data = (await r.json()) as any;
      if (!data?.ok) throw new Error(data?.message || 'Scan failed');

      setQuota(consumeOne(quota));
      setResp({ ok: true, parsed: data.parsed, rawText: data.rawModelText || '', mode: 'openrouter' });
    } catch (e: any) {
      setResp({ ok: false, message: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function runBrowserOcr() {
    if (!file) return;
    setLoading(true);
    setResp(null);
    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const rawText = data.text || '';
      setResp({ ok: true, parsed: parseFromText(rawText), rawText, mode: 'browser-ocr' });
    } catch (e: any) {
      setResp({ ok: false, message: 'Browser OCR failed: ' + String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function runLocalApi() {
    if (!file) return;
    if (!localApi.url) {
      setResp({ ok: false, message: 'Missing Local API URL' });
      return;
    }
    setLoading(true);
    setResp(null);
    try {
      const scaled = await downscaleToJpeg(file, 1600);
      const fd = new FormData();
      fd.append('file', scaled);

      const base = localApi.url.replace(/\/$/, '');
      const url = `${base}/scan`;
      const r = await fetch(url, {
        method: 'POST',
        body: fd,
        headers: localApi.key ? { 'x-api-key': localApi.key } : {},
      });
      const data = (await r.json()) as any;
      if (!data?.ok) throw new Error(data?.message || 'Local API failed');

      // Re-parse locally to add confidence/validation.
      setResp({ ok: true, parsed: parseFromText(data.rawText || ''), rawText: data.rawText || '', mode: 'local-api' });
    } catch (e: any) {
      setResp({ ok: false, message: 'Local API failed: ' + String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function copy(s: string | null) {
    if (!s) return;
    await navigator.clipboard.writeText(s);
  }

  function donate() {
    // legacy honor button (kept for quick local testing)
    if (!quota) return;
    setQuota(applyDonate(quota));
  }

  const donateAddr = useMemo(() => {
    const avax = '0xab272ADCc18534a52474979aC6a6AF237553FA0e';
    const dfk = '0xab272ADCc18534a52474979aC6a6AF237553FA0e';
    const sol = '4NJYnpk4eLfuigUB2tbdZTY2jy45zTL8eptp1MFx8wfS';
    return donateChain === 'avax' ? avax : donateChain === 'dfk' ? dfk : sol;
  }, [donateChain]);

  function explorerTxUrl(chain: DonateChain, txid: string) {
    const t = txid.trim();
    if (!t) return null;
    if (chain === 'sol') return `https://solscan.io/tx/${encodeURIComponent(t)}`;
    if (chain === 'dfk') return `https://explorer.dfkchain.com/tx/${encodeURIComponent(t)}`;
    return `https://snowtrace.io/tx/${encodeURIComponent(t)}`;
  }

  async function copyText(s: string) {
    try {
      await navigator.clipboard.writeText(s);
    } catch {
      // ignore
    }
  }

  const [notice, setNotice] = useState<string | null>(null);

  function isValidTxid(chain: DonateChain, txid: string) {
    const s = txid.trim();
    if (!s) return false;
    if (chain === 'sol') {
      // Solana signatures are base58, typically 80-90 chars.
      return /^[1-9A-HJ-NP-Za-km-z]{70,100}$/.test(s);
    }
    // EVM tx hash
    return /^0x[a-fA-F0-9]{64}$/.test(s);
  }

  function applyCryptoTxid() {
    if (!quota || !donations) return;
    const txid = donateTxid.trim();
    if (!txid) {
      setNotice(t.txidMissing);
      return;
    }
    if (!isValidTxid(donateChain, txid)) {
      setNotice('Invalid txid format');
      return;
    }
    if (isTxidUsed(donations, donateChain, txid)) {
      setNotice(t.txidUsed);
      return;
    }

    setDonations(addUsedTxid(donations, donateChain, txid));
    setQuota(addBonus(quota, 10));
    setDonateTxid('');
    setNotice(t.added10);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{t.tagline}</p>
          </div>
          <div className="hidden sm:block text-xs text-gray-500 mt-2">v0.1</div>
        </div>

        <div className="mt-5 p-4 sm:p-5 border bg-white rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="file"
              className="hidden"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResp(null);
              }}
            />

            <label
              htmlFor="file"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 cursor-pointer"
            >
              {t.chooseImage}
            </label>

            {mounted && canUseCamera ? (
              !cameraOn ? (
                <button
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
                  onClick={startCamera}
                  disabled={loading}
                >
                  {t.startCamera}
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
                  onClick={stopCamera}
                  disabled={loading}
                >
                  {t.stopCamera}
                </button>
              )
            ) : null}

            <span className="text-sm text-gray-600 truncate max-w-[260px]">
              {file ? file.name : t.noFile}
            </span>
          </div>

        {cameraOn ? (
          <div className="mt-3">
            <video ref={videoRef} className="w-full rounded border" playsInline muted />
            <div className="mt-2">
              <button className="px-3 py-2 border rounded" onClick={capturePhoto}>
                {t.capture}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <button
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            onClick={runOpenRouter}
            disabled={loading || !file}
          >
            {loading ? t.running : t.runAI}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 border disabled:opacity-50"
            onClick={runBrowserOcr}
            disabled={loading || !file}
          >
            {loading ? t.running : t.runFree}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50"
            onClick={runLocalApi}
            disabled={loading || !file}
            title="Uses your local server via tunnel"
          >
            {loading ? t.running : t.runLocal}
          </button>

          <div className="text-sm text-gray-600">
            {quota
              ? `${t.scansLeft}: ${quota.freeLeft + quota.bonusLeft} (free ${quota.freeLeft}, bonus ${quota.bonusLeft})`
              : '…'}
          </div>

          <button
            className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 border border-indigo-200 disabled:opacity-50"
            onClick={donate}
            disabled={!quota || quota.donatedToday}
          >
            {quota?.donatedToday ? t.donatedToday : t.iDonated}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 items-center text-sm">
          <label className="flex items-center gap-2">
            <span className="text-gray-600">{t.preset}</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={prefs.preset}
              onChange={(e) => setPrefs((p) => ({ ...p, preset: e.target.value as any }))}
            >
              <option value="auto">Auto</option>
              <option value="no">Norway (KID + konto)</option>
              <option value="iban">IBAN</option>
              <option value="generic">Generic</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-gray-600">{t.language}</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={prefs.lang}
              onChange={(e) => setPrefs((p) => ({ ...p, lang: e.target.value as any }))}
            >
              <option value="auto">Auto</option>
              <option value="no">Norwegian</option>
              <option value="en">English</option>
            </select>
          </label>

          <span className="text-gray-500">{t.saved}</span>
        </div>

        <div className="mt-4 p-4 rounded-xl border bg-white">
          <div className="font-medium">{t.localApiTitle}</div>
          <div className="mt-2 flex flex-wrap gap-3 items-center text-sm">
            <label className="flex items-center gap-2">
              <span className="text-gray-600">{t.localApiUrl}</span>
              <input
                className="border rounded px-2 py-1 bg-white w-[360px] max-w-full"
                value={localApi.url}
                onChange={(e) => setLocalApi((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://xxxx.trycloudflare.com"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-600">{t.localApiKey}</span>
              <input
                className="border rounded px-2 py-1 bg-white w-[240px] max-w-full"
                value={localApi.key}
                onChange={(e) => setLocalApi((p) => ({ ...p, key: e.target.value }))}
                placeholder="…"
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            API runs on your PC (tesseract). Tunnel gives you HTTPS without a fixed IP.
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border bg-white">
          <div className="font-medium">{t.donateCryptoTitle}</div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-gray-600">{t.donateChain}</span>
              <select
                className="border rounded px-2 py-1 bg-white"
                value={donateChain}
                onChange={(e) => setDonateChain(e.target.value as any)}
              >
                <option value="sol">SOL</option>
                <option value="avax">AVAX</option>
                <option value="dfk">DFK Chain</option>
              </select>
            </label>

            <div className="text-gray-600">{t.donateAddress}:</div>
            <code className="text-xs bg-gray-50 border rounded px-2 py-1">{donateAddr}</code>
            <button
              className="px-3 py-1.5 rounded-lg bg-gray-100 border hover:bg-gray-200"
              onClick={() => copyText(donateAddr)}
              type="button"
            >
              {t.copyAddress}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-gray-600">{t.txid}</span>
              <input
                className="border rounded px-2 py-1 bg-white w-[360px] max-w-full"
                value={donateTxid}
                onChange={(e) => setDonateTxid(e.target.value)}
                placeholder="0x… / …"
              />
            </label>
            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              onClick={applyCryptoTxid}
              disabled={!quota || !donations}
              type="button"
            >
              {t.applyTxid}
            </button>

            {donateTxid.trim() ? (
              <a
                className="text-sm text-indigo-700 underline"
                href={explorerTxUrl(donateChain, donateTxid) ?? '#'}
                target="_blank"
                rel="noreferrer"
              >
                explorer
              </a>
            ) : null}
          </div>

          {notice ? <div className="mt-2 text-sm text-gray-700">{notice}</div> : null}
          <div className="mt-2 text-xs text-gray-500">{t.donateNote}</div>
        </div>

        {resp && !resp.ok ? (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {resp.message}
          </div>
        ) : null}

        {resp && resp.ok ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
            <div className="text-sm text-gray-600">
              {t.mode}: {resp.mode} • {t.detected}: {resp.parsed.mode}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => copy(resp.parsed.kid)}
                disabled={!resp.parsed.kid}
              >
                {t.copyKID}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => copy(resp.parsed.konto)}
                disabled={!resp.parsed.konto}
              >
                {t.copyKonto}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => copy(resp.parsed.iban)}
                disabled={!resp.parsed.iban}
              >
                {t.copyIBAN}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => copy(resp.parsed.amount)}
                disabled={!resp.parsed.amount}
              >
                {t.copyAmount}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                onClick={() => copy(resp.parsed.dueDate)}
                disabled={!resp.parsed.dueDate}
              >
                {t.copyDue}
              </button>
            </div>

            {resp.parsed.confidence ? (
              <div className="mt-3 text-xs text-gray-600">
                Confidence — KID: {resp.parsed.confidence.kid ?? '—'} • Konto: {resp.parsed.confidence.konto ?? '—'} • IBAN:{' '}
                {resp.parsed.confidence.iban ?? '—'}
              </div>
            ) : null}

            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(resp.parsed, null, 2)}</pre>

            <details className="mt-2">
              <summary className="text-sm text-gray-600 cursor-pointer">{t.rawText}</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap">{resp.rawText}</pre>
            </details>
          </div>
        ) : null}
      </div>

      <div className="mt-6 text-xs text-gray-500 flex gap-3">
        <a className="underline" href="/about">
          About
        </a>
        <a className="underline" href="/privacy">
          Privacy
        </a>
        <span>•</span>
        <span>Donate-knappen er MVP (honor-system). Senere kan vi verifisere betalinger.</span>
      </div>
      </div>
    </div>
  );
}
