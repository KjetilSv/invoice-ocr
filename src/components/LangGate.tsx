'use client';

import { useEffect, useState } from 'react';

export type Lang = 'en' | 'no';

const KEY = 'invoiceocr_lang_v1';

function detectBrowserLang(): Lang {
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('no') || l.startsWith('nb') || l.startsWith('nn') ? 'no' : 'en';
}

function applyLang(lang: Lang) {
  document.documentElement.dataset.lang = lang;
}

export default function LangGate(props: { compact?: boolean }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Lang | null) || null;
    const l: Lang = saved === 'no' || saved === 'en' ? saved : detectBrowserLang();
    setLang(l);
    applyLang(l);
  }, []);

  function choose(l: Lang) {
    setLang(l);
    localStorage.setItem(KEY, l);
    applyLang(l);
  }

  const btn = (l: Lang, label: string) => (
    <button
      type="button"
      onClick={() => choose(l)}
      className={
        'px-2 py-1 rounded border text-xs ' +
        (lang === l ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50')
      }
      aria-pressed={lang === l}
    >
      {label}
    </button>
  );

  return (
    <div className={props.compact ? '' : 'mt-3'}>
      <div className="inline-flex gap-2 items-center">
        {btn('no', 'NO')}
        {btn('en', 'EN')}
      </div>
    </div>
  );
}
