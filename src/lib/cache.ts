/**
 * Small in-memory TTL cache for expensive, shareable read results (e.g. DB
 * queries whose result is the same for every requester within a short
 * window). Not for per-user data — callers should exclude anything
 * user-specific from what they cache and apply it after reading the cache.
 *
 * Like rate-limit.ts's store, this is per-instance/in-memory: fine for the
 * current single-instance deployment, but would need a shared store (e.g.
 * Redis) to stay effective across multiple instances.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Returns the cached value for `key` if present and not expired, otherwise
 * computes it via `compute`, stores it with the given TTL, and returns it.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = store.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value as T;
  }

  const value = await compute();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Test-only: clears all cached entries so test cases don't leak state. */
export function __clearCacheForTests(): void {
  store.clear();
}
