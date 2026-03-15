export type DonateChain = 'sol' | 'avax' | 'dfk';

export type DonationRecord = {
  // Keep txids for a while to reduce easy re-use.
  // We prune to the last 30 days.
  usedTxids: Record<DonateChain, { txid: string; ts: number }[]>;
};

const KEY = 'invoiceocr_donations_v2';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function prune(r: DonationRecord, now = Date.now()): DonationRecord {
  const keepAfter = now - MAX_AGE_MS;
  const out: DonationRecord = {
    usedTxids: { sol: [], avax: [], dfk: [] },
  };
  for (const chain of ['sol', 'avax', 'dfk'] as DonateChain[]) {
    out.usedTxids[chain] = (r.usedTxids[chain] || []).filter((x) => typeof x?.ts === 'number' && x.ts >= keepAfter);
  }
  return out;
}

export function loadDonations(): DonationRecord {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { usedTxids: { sol: [], avax: [], dfk: [] } };
    const r = JSON.parse(raw) as Partial<DonationRecord>;
    const used = (r.usedTxids || {}) as any;
    const normalized: DonationRecord = {
      usedTxids: {
        sol: Array.isArray(used.sol) ? used.sol : [],
        avax: Array.isArray(used.avax) ? used.avax : [],
        dfk: Array.isArray(used.dfk) ? used.dfk : [],
      },
    };
    return prune(normalized);
  } catch {
    return { usedTxids: { sol: [], avax: [], dfk: [] } };
  }
}

export function saveDonations(r: DonationRecord) {
  localStorage.setItem(KEY, JSON.stringify(prune(r)));
}

export function normalizeTxid(txid: string) {
  return txid.trim();
}

export function isTxidUsed(r: DonationRecord, chain: DonateChain, txid: string) {
  const t = normalizeTxid(txid);
  return (r.usedTxids[chain] || []).some((x) => normalizeTxid(x?.txid) === t);
}

export function addUsedTxid(r: DonationRecord, chain: DonateChain, txid: string): DonationRecord {
  const t = normalizeTxid(txid);
  if (!t) return r;
  if (isTxidUsed(r, chain, t)) return r;
  const now = Date.now();
  return {
    ...r,
    usedTxids: {
      ...r.usedTxids,
      [chain]: [...(r.usedTxids[chain] || []), { txid: t, ts: now }],
    },
  };
}
