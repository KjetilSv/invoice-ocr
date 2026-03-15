import { normalizeKid, normalizeKonto, validateIban } from '@/lib/validate';

export type Parsed = {
  mode: 'no' | 'iban' | 'generic';
  kid: string | null;
  konto: string | null;
  iban: string | null;
  bic: string | null;
  reference: string | null;
  amount: string | null;
  dueDate: string | null;
  notes: string | null;
  confidence?: {
    kid?: 'low' | 'medium' | 'high';
    konto?: 'low' | 'medium' | 'high';
    iban?: 'low' | 'medium' | 'high';
  };
};

export function parseFromText(text: string): Parsed {
  const t = String(text || '').replace(/\u00a0/g, ' ');

  // konto: 11 digits, often 1234.56.78901
  const kontoMatches = Array.from(t.matchAll(/\b(\d{4}[ .]?\d{2}[ .]?\d{5})\b/g)).map((m) => m[1]);
  const kontoRaw = kontoMatches[0] ? kontoMatches[0].replace(/[ .]/g, '') : null;
  const konto = normalizeKonto(kontoRaw);

  // IBAN
  const ibanMatches = Array.from(t.matchAll(/\b([A-Z]{2}\d{2}[A-Z0-9][A-Z0-9 ]{10,32})\b/g)).map((m) =>
    m[1].replace(/\s+/g, '').toUpperCase(),
  );
  const ibanCandidate = ibanMatches.find((x) => validateIban(x)) || (ibanMatches[0] ?? null);
  const iban = ibanCandidate && validateIban(ibanCandidate) ? ibanCandidate : null;

  // BIC/SWIFT (rough)
  const bicMatch = t.match(/\b([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?)\b/);
  const bic = bicMatch ? bicMatch[1] : null;

  // KID heuristic
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let kid: string | null = null;

  // Prefer lines containing keyword
  for (const l of lines) {
    if (/\bkid\b/i.test(l)) {
      const m = l.match(/(\d[\d ]{4,28}\d)/);
      if (m) {
        kid = normalizeKid(m[1]);
        if (kid) break;
      }
    }
  }

  // Fallback: pick a longer digit sequence, avoid orgnr/phone lengths when possible
  if (!kid) {
    const candidates = Array.from(t.matchAll(/\b(\d[\d ]{6,28}\d)\b/g))
      .map((m) => m[1].replace(/\s+/g, ''))
      .map((s) => normalizeKid(s))
      .filter(Boolean) as string[];

    // Prefer length >= 10
    kid = candidates.find((s) => s.length >= 10) || candidates[0] || null;
  }

  // amount
  const amountMatches = Array.from(t.matchAll(/\b(\d{1,3}(?:[ .]\d{3})*(?:[.,]\d{2}))\b/g)).map((m) => m[1]);
  const amount = amountMatches[0] ?? null;

  // due date
  const dateMatches = Array.from(t.matchAll(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g)).map((m) => {
    const dd = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    let yy = String(m[3]);
    if (yy.length === 2) yy = '20' + yy;
    return `${dd}.${mm}.${yy}`;
  });
  const dueDate = dateMatches[0] ?? null;

  const mode: Parsed['mode'] = kid || konto ? 'no' : iban ? 'iban' : 'generic';
  const reference = kid || null;

  const confidence: Parsed['confidence'] = {
    konto: konto ? 'high' : kontoRaw ? 'medium' : 'low',
    kid: kid ? (kid.length >= 10 ? 'high' : 'medium') : 'low',
    iban: iban ? 'high' : ibanMatches.length ? 'medium' : 'low',
  };

  return {
    mode,
    kid,
    konto,
    iban,
    bic,
    reference,
    amount,
    dueDate,
    notes: null,
    confidence,
  };
}
