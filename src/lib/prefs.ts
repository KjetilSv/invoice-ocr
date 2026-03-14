export type Preset = 'auto' | 'no' | 'iban' | 'generic';
export type UiLang = 'auto' | 'no' | 'en';

export type Prefs = {
  preset: Preset;
  lang: UiLang;
};

const KEY = 'invoiceocr_prefs_v1';

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { preset: 'auto', lang: 'auto' };
    const p = JSON.parse(raw) as Partial<Prefs>;
    const preset: Preset =
      p.preset === 'auto' || p.preset === 'no' || p.preset === 'iban' || p.preset === 'generic' ? p.preset : 'auto';
    const lang: UiLang = p.lang === 'auto' || p.lang === 'no' || p.lang === 'en' ? p.lang : 'auto';
    return { preset, lang };
  } catch {
    return { preset: 'auto', lang: 'auto' };
  }
}

export function savePrefs(p: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
