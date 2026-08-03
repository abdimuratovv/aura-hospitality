// In-memory login attempt tracking — fine for this single-process dev deployment,
// not durable across restarts or multiple instances. Revisit with a shared store
// (Redis) if this ever runs behind more than one Node process.
const failures = new Map();

export function isRateLimited(key, { max = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const bucket = failures.get(key);
  if (!bucket || Date.now() > bucket.resetAt) return false;
  return bucket.count >= max;
}

export function recordFailure(key, { windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const bucket = failures.get(key);
  if (!bucket || now > bucket.resetAt) {
    failures.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
}

export function clearRateLimit(key) {
  failures.delete(key);
}
