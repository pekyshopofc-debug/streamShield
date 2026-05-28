import NodeCache from 'node-cache';

const globalForCache = globalThis as unknown as { cache: NodeCache };

const cache =
  globalForCache.cache ??
  new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false,
  });

if (process.env.NODE_ENV !== 'production') globalForCache.cache = cache;

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

export function deleteCache(key: string): void {
  cache.del(key);
}

export function flushCache(): void {
  cache.flushAll();
}

export function getCacheStats() {
  return cache.getStats();
}
