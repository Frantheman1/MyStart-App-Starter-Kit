/**
 * Simple Cache Implementation
 * 
 * In-memory cache with TTL support for API responses.
 * For more robust solutions, consider React Query or SWR.
 * 
 * Usage:
 *   cache.set('user', userData, 60000); // Cache for 1 minute
 *   const user = cache.get('user');
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    // Default TTL: 5 minutes
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache has a valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }
}

// Export singleton instance
export const cache = new Cache();

// Periodically clear expired entries (every 5 minutes)
setInterval(() => {
  cache.clearExpired();
}, 300000);

/**
 * Higher-order function for cached API calls
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = getCacheKey(...args);
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}
