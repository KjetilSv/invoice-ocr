export type LocalApiPrefs = {
  url: string; // e.g. https://xxxx.trycloudflare.com
  key: string;
};

const KEY = 'invoiceocr_local_api_v1';

export function loadLocalApiPrefs(): LocalApiPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { url: '', key: '' };
    const p = JSON.parse(raw) as Partial<LocalApiPrefs>;
    return {
      url: typeof p.url === 'string' ? p.url : '',
      key: typeof p.key === 'string' ? p.key : '',
    };
  } catch {
    return { url: '', key: '' };
  }
}

export function saveLocalApiPrefs(p: LocalApiPrefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
