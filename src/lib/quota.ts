export type QuotaState = {
  day: string; // YYYY-MM-DD (local)
  freeLeft: number; // starts at 3/day
  bonusLeft: number; // donate credits
  donatedToday: boolean; // legacy flag (MVP button). Not used for crypto-based top-ups.
};

const KEY = 'invoiceocr_quota_v1';

function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function loadQuota(): QuotaState {
  const day = todayLocal();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { day, freeLeft: 3, bonusLeft: 0, donatedToday: false };
    const q = JSON.parse(raw) as Partial<QuotaState>;
    if (q.day !== day) return { day, freeLeft: 3, bonusLeft: 0, donatedToday: false };
    return {
      day,
      freeLeft: typeof q.freeLeft === 'number' ? q.freeLeft : 3,
      bonusLeft: typeof q.bonusLeft === 'number' ? q.bonusLeft : 0,
      donatedToday: !!q.donatedToday,
    };
  } catch {
    return { day, freeLeft: 3, bonusLeft: 0, donatedToday: false };
  }
}

export function saveQuota(q: QuotaState) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function canScan(q: QuotaState) {
  return q.freeLeft + q.bonusLeft > 0;
}

export function consumeOne(q: QuotaState): QuotaState {
  const next = { ...q };
  if (next.bonusLeft > 0) next.bonusLeft -= 1;
  else if (next.freeLeft > 0) next.freeLeft -= 1;
  return next;
}

export function applyDonate(q: QuotaState): QuotaState {
  // MVP: honor once/day; adds +10 scans
  const next = { ...q };
  if (!next.donatedToday) {
    next.bonusLeft += 10;
    next.donatedToday = true;
  }
  return next;
}

export function addBonus(q: QuotaState, n: number): QuotaState {
  const next = { ...q };
  next.bonusLeft += Math.max(0, Math.floor(n));
  return next;
}
