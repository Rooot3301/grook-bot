const buckets = new Map();
export function allowAction(key, { max = 5, windowMs = 10000 } = {}) {
  const now = Date.now(); const b = buckets.get(key) || { tokens: max, updatedAt: now };
  const elapsed = now - b.updatedAt; const refill = Math.floor(elapsed / windowMs) * max;
  b.tokens = Math.min(max, b.tokens + (refill > 0 ? refill : 0));
  b.updatedAt = refill > 0 ? now : b.updatedAt;
  if (b.tokens <= 0) { buckets.set(key, b); return false; }
  b.tokens -= 1; buckets.set(key, b); return true;
}