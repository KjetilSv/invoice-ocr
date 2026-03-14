export type DonateChain = 'sol' | 'avax' | 'dfk';

export type DonationRecord = {
  day: string; // YYYY-MM-DD local
  usedTxids: Record<DonateChain, string[]>;
};

const KEY = 'invoiceocr_donations_v1';

function todayLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function loadDonations(): DonationRecord {
  const day = todayLocal();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw)
      return {
        day,
        usedTxids: { sol: [], avax: [], dfk: [] },
      };
    const r = JSON.parse(raw) as Partial<DonationRecord>;
    if (r.day !== day)
      return {
        day,
        usedTxids: { sol: [], avax: [], dfk: [] },
      };
    const used = (r.usedTxids || {}) as any;
    return {
      day,
      usedTxids: {
        sol: Array.isArray(used.sol) ? used.sol : [],
        avax: Array.isArray(used.avax) ? used.avax : [],
        dfk: Array.isArray(used.dfk) ? used.dfk : [],
      },
    };
  } catch {
    return {
      day,
      usedTxids: { sol: [], avax: [], dfk: [] },
    };
  }
}

export function saveDonations(r: DonationRecord) {
  localStorage.setItem(KEY, JSON.stringify(r));
}

export function normalizeTxid(txid: string) {
  return txid.trim();
}

export function isTxidUsed(r: DonationRecord, chain: DonateChain, txid: string) {
  const t = normalizeTxid(txid);
  return r.usedTxids[chain].some((x) => normalizeTxid(x) === t);
}

export function addUsedTxid(r: DonationRecord, chain: DonateChain, txid: string): DonationRecord {
  const t = normalizeTxid(txid);
  if (!t) return r;
  if (isTxidUsed(r, chain, t)) return r;
  return {
    ...r,
    usedTxids: {
      ...r.usedTxids,
      [chain]: [...r.usedTxids[chain], t],
    },
  };
}
