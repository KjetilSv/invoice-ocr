import { NextResponse } from 'next/server';

type Parsed = {
  mode: 'no' | 'iban' | 'generic';
  kid: string | null;
  konto: string | null;
  iban: string | null;
  bic: string | null;
  reference: string | null;
  amount: string | null;
  dueDate: string | null;
  notes: string | null;
};

type Ok = { ok: true; parsed: Parsed; rawModelText: string; model: string };
type Err = { ok: false; message: string };

function extractJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

function digitsOnly(s: unknown) {
  if (typeof s !== 'string') return null;
  const d = s.replace(/\D/g, '');
  return d.length ? d : null;
}

function strOrNull(s: unknown) {
  return typeof s === 'string' && s.trim() ? s.trim() : null;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'Missing OPENROUTER_API_KEY. Set it in environment or create .env.local with OPENROUTER_API_KEY=... and restart.',
        } satisfies Err,
        { status: 500 },
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, message: 'Missing file (field name: file)' } satisfies Err, { status: 400 });
    }

    const model = String(form.get('model') || 'openrouter/auto');

    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = file.type || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`;

    const system =
      'You extract payment details from invoices. Return ONLY valid JSON with keys: ' +
      'mode, kid, konto, iban, bic, reference, amount, dueDate, notes. ' +
      "mode must be one of: 'no' (Norway KID/konto), 'iban', 'generic'. " +
      'kid/konto must be digits only (strip spaces/dots), or null. ' +
      'iban should be uppercase without spaces if possible, or null. ' +
      'amount: string as seen (e.g. 1234,56). dueDate: dd.mm.yyyy if present. ' +
      'notes: brief or null. If unknown, use null.';

    const body = {
      model,
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract payment fields from this invoice image.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    };

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Invoice OCR (minimal)',
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json(
        { ok: false, message: `OpenRouter error ${r.status}: ${t.slice(0, 1000)}` } satisfies Err,
        { status: 500 },
      );
    }

    const j = (await r.json()) as any;
    const rawText: string = j?.choices?.[0]?.message?.content ?? '';
    const jsonText = extractJsonObject(rawText) ?? rawText;

    let parsedAny: any;
    try {
      parsedAny = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { ok: false, message: 'Model did not return valid JSON. Raw: ' + rawText.slice(0, 1000) } satisfies Err,
        { status: 500 },
      );
    }

    const parsed: Parsed = {
      mode: parsedAny.mode === 'no' || parsedAny.mode === 'iban' || parsedAny.mode === 'generic' ? parsedAny.mode : 'generic',
      kid: digitsOnly(parsedAny.kid),
      konto: digitsOnly(parsedAny.konto),
      iban: typeof parsedAny.iban === 'string' ? parsedAny.iban.replace(/\s+/g, '').toUpperCase() : null,
      bic: strOrNull(parsedAny.bic),
      reference: strOrNull(parsedAny.reference),
      amount: strOrNull(parsedAny.amount),
      dueDate: strOrNull(parsedAny.dueDate),
      notes: strOrNull(parsedAny.notes),
    };

    return NextResponse.json({ ok: true, parsed, rawModelText: rawText, model } satisfies Ok);
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: String(err?.message || err) } satisfies Err, { status: 500 });
  }
}
