const KEY = 'invoiceocr_admin_authed_v1';

export function isAdminAuthed() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminAuthed(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
}

export function clearAdminAuth() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function getAdminPassword(): string {
  // Set this in Cloudflare Pages env vars.
  return (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '').trim();
}
