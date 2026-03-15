export type AdminPrefs = {
  aiEnabled: boolean;
  localApiUrl: string;
  localApiKey: string;
};

const KEY = 'invoiceocr_admin_prefs_v1';

export function loadAdminPrefs(): AdminPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { aiEnabled: false, localApiUrl: '', localApiKey: '' };
    const p = JSON.parse(raw) as Partial<AdminPrefs>;
    return {
      aiEnabled: !!p.aiEnabled,
      localApiUrl: typeof p.localApiUrl === 'string' ? p.localApiUrl : '',
      localApiKey: typeof p.localApiKey === 'string' ? p.localApiKey : '',
    };
  } catch {
    return { aiEnabled: false, localApiUrl: '', localApiKey: '' };
  }
}

export function saveAdminPrefs(p: AdminPrefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
