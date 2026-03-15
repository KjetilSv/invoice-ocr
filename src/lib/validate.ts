export function isDigits(s: string) {
  return /^\d+$/.test(s);
}

// IBAN checksum validation (mod 97)
export function validateIban(ibanRaw: string): boolean {
  const iban = ibanRaw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  // Convert letters to numbers: A=10..Z=35
  let expanded = '';
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) expanded += ch;
    else expanded += String(code - 55);
  }

  // Compute mod 97 in chunks to avoid bigints.
  let mod = 0;
  for (let i = 0; i < expanded.length; i += 7) {
    const part = String(mod) + expanded.slice(i, i + 7);
    mod = Number(part) % 97;
  }
  return mod === 1;
}

export function normalizeKonto(s: string | null) {
  if (!s) return null;
  const d = s.replace(/\D/g, '');
  return d.length === 11 ? d : null;
}

export function normalizeKid(s: string | null) {
  if (!s) return null;
  const d = s.replace(/\D/g, '');
  // KID varies; keep a sane range
  if (d.length < 7 || d.length > 25) return null;
  return d;
}
