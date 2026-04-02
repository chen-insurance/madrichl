/**
 * Simple client-side rate limiter using sessionStorage.
 * NOT a replacement for server-side rate limiting, but adds a layer of protection.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const STORAGE_PREFIX = 'rl_';

export function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const storageKey = STORAGE_PREFIX + key;
  const now = Date.now();

  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return false;

    const entry: RateLimitEntry = JSON.parse(raw);

    // Window expired, reset
    if (now - entry.firstAttempt > windowMs) {
      sessionStorage.removeItem(storageKey);
      return false;
    }

    return entry.count >= maxAttempts;
  } catch {
    return false;
  }
}

export function recordAttempt(key: string, windowMs: number): void {
  const storageKey = STORAGE_PREFIX + key;
  const now = Date.now();

  try {
    const raw = sessionStorage.getItem(storageKey);
    let entry: RateLimitEntry;

    if (raw) {
      entry = JSON.parse(raw);
      if (now - entry.firstAttempt > windowMs) {
        entry = { count: 1, firstAttempt: now };
      } else {
        entry.count++;
      }
    } else {
      entry = { count: 1, firstAttempt: now };
    }

    sessionStorage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
}

export function getRemainingCooldown(key: string, windowMs: number): number {
  const storageKey = STORAGE_PREFIX + key;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return 0;
    const entry: RateLimitEntry = JSON.parse(raw);
    const elapsed = Date.now() - entry.firstAttempt;
    return Math.max(0, windowMs - elapsed);
  } catch {
    return 0;
  }
}
