const bucket = new Map<string, { count: number; ts: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const entry = bucket.get(key) ?? { count: 0, ts: now };

  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }

  entry.count++;
  bucket.set(key, entry);

  if (entry.count > limit) {
    throw new Error("Too many requests");
  }
}
