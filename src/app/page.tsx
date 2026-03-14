'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { applyDonate, canScan, consumeOne, loadQuota, saveQuota, type QuotaState } from '@/lib/quota';

type Parsed = {
  mode: 'no' | 'iban' | 'generic';
  kid: string | null;
  konto: string | null;
  iban: string | null;
  bic: string | null;
  reference: string | null;
  amount: string | null;
  dueDate: string | null;
  notes: string | null;
};

type Resp =
  | { ok: true; parsed: Parsed; rawText: string; mode: 'openrouter' | 'browser-ocr' }
  | { ok: false; message: string };

function parseCandidates(text: string): Parsed {
  const t = text.replace(/\u00a0/g, ' ');

  const kontoMatches = Array.from(t.matchAll(/\b(\d{4}[ .]?\d{2}[ .]?\d{5})\b/g)).map((m) => m[1]);
  const konto = kontoMatches[0] ? kontoMatches[0].replace(/[ .]/g, '') : null;

  const ibanMatch = t.match(/\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b/);
  const iban = ibanMatch ? ibanMatch[1].replace(/\s+/g, '').toUpperCase() : null;

  const kidLine = t.split(/\r?\n/).find((l) => /\bkid\b/i.test(l));
  let kid: string | null = null;
  if (kidLine) {
    const m = kidLine.match(/(\d[\d ]{4,28}\d)/);
    if (m) kid = m[1].replace(/\s+/g, '');
  }
  if (!kid) {
    const longDigits = Array.from(t.matchAll(/\b(\d[\d ]{6,28}\d)\b/g))
      .map((m) => m[1].replace(/\s+/g, ''))
      .filter((s) => s.length >= 7 && s.length <= 25);
    kid = longDigits[0] ?? null;
  }

  const amountMatches = Array.from(t.matchAll(/\b(\d{1,3}(?:[ .]\d{3})*(?:[.,]\d{2}))\b/g)).map((m) => m[1]);
  const amount = amountMatches[0] ?? null;

  const dateMatches = Array.from(t.matchAll(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g)).map((m) => {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    let yy = m[3];
    if (yy.length === 2) yy = '20' + yy;
    return `${dd}.${mm}.${yy}`;
  });
  const dueDate = dateMatches[0] ?? null;

  const mode: Parsed['mode'] = kid || konto ? 'no' : iban ? 'iban' : 'generic';

  return {
    mode,
    kid,
    konto,
    iban,
    bic: null,
    reference: kid ?? null,
    amount,
    dueDate,
    notes: null,
  };
}

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

  // Camera (preview) – only secure contexts
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [canUseCamera, setCanUseCamera] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuota(loadQuota());
    // Camera preview requires secure context (https/localhost) and getUserMedia.
    setCanUseCamera(Boolean((window as any).isSecureContext && navigator.mediaDevices?.getUserMedia));
  }, []);

  useEffect(() => {
    if (!quota) return;
    saveQuota(quota);
  }, [quota]);

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
      setResp({ ok: false, message: 'No scans left today. Donate to get +10 scans.' });
      return;
    }

    setLoading(true);
    setResp(null);
    try {
      const scaled = await downscaleToJpeg(file, 1600);
      const fd = new FormData();
      fd.append('file', scaled);

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
      setResp({ ok: true, parsed: parseCandidates(rawText), rawText, mode: 'browser-ocr' });
    } catch (e: any) {
      setResp({ ok: false, message: 'Browser OCR failed: ' + String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  async function copy(s: string | null) {
    if (!s) return;
    await navigator.clipboard.writeText(s);
  }

  function donate() {
    if (!quota) return;
    setQuota(applyDonate(quota));
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Invoice OCR</h1>
      <p className="text-sm text-gray-600 mt-1">
        Super enkel: ta bilde / last opp → copy betalingsfelt. Vi lagrer ingenting (MVP).
      </p>

      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResp(null);
            }}
          />

          {mounted && canUseCamera ? (
            !cameraOn ? (
              <button className="px-3 py-2 border rounded" onClick={startCamera} disabled={loading}>
                Start camera
              </button>
            ) : (
              <button className="px-3 py-2 border rounded" onClick={stopCamera} disabled={loading}>
                Stop camera
              </button>
            )
          ) : null}
        </div>

        {cameraOn ? (
          <div className="mt-3">
            <video ref={videoRef} className="w-full rounded border" playsInline muted />
            <div className="mt-2">
              <button className="px-3 py-2 border rounded" onClick={capturePhoto}>
                Capture
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <button className="px-3 py-2 border rounded" onClick={runOpenRouter} disabled={loading || !file}>
            {loading ? 'Running…' : 'Run (AI)'}
          </button>
          <button className="px-3 py-2 border rounded" onClick={runBrowserOcr} disabled={loading || !file}>
            {loading ? 'Running…' : 'Run (free OCR)'}
          </button>

          <div className="text-sm text-gray-600">
            {quota ? `Scans left today: ${quota.freeLeft + quota.bonusLeft} (free ${quota.freeLeft}, bonus ${quota.bonusLeft})` : '…'}
          </div>

          <button className="px-3 py-2 border rounded" onClick={donate} disabled={!quota || quota.donatedToday}>
            {quota?.donatedToday ? 'Donated today (+10 applied)' : 'I donated (+10 scans)'}
          </button>
        </div>

        {resp && !resp.ok ? <div className="mt-3 text-sm text-red-600">{resp.message}</div> : null}

        {resp && resp.ok ? (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <div className="text-sm text-gray-600">Mode: {resp.mode} • detected: {resp.parsed.mode}</div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => copy(resp.parsed.kid)} disabled={!resp.parsed.kid}>
                Copy KID
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => copy(resp.parsed.konto)} disabled={!resp.parsed.konto}>
                Copy konto
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => copy(resp.parsed.iban)} disabled={!resp.parsed.iban}>
                Copy IBAN
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => copy(resp.parsed.amount)} disabled={!resp.parsed.amount}>
                Copy amount
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => copy(resp.parsed.dueDate)} disabled={!resp.parsed.dueDate}>
                Copy due date
              </button>
            </div>

            <pre className="mt-3 text-sm whitespace-pre-wrap">{JSON.stringify(resp.parsed, null, 2)}</pre>

            <details className="mt-2">
              <summary className="text-sm text-gray-600 cursor-pointer">Raw text</summary>
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
  );
}
