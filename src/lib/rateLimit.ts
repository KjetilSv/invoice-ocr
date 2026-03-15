type Entry = { count: number; resetAt: number };

// Very small in-memory rate limiter (per server instance).
// Good enough for MVP / local use; for production use Redis/Upstash/etc.
const bucket = new Map<string, Entry>();

export function rateLimit(key: string, opts?: { limit?: number; windowMs?: number }) {
  const limit = opts?.limit ?? 30;
  const windowMs = opts?.windowMs ?? 60_000;
  const now = Date.now();

  const e = bucket.get(key);
  if (!e || e.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (e.count >= limit) {
    return { ok: false, remaining: 0, resetAt: e.resetAt };
  }

  e.count += 1;
  bucket.set(key, e);
  return { ok: true, remaining: limit - e.count, resetAt: e.resetAt };
}
