/**
 * Rate Limiting
 * 
 * Prevent API spam and limit request frequency.
 * 
 * Usage:
 *   import { rateLimiter } from '@/lib/rate-limit';
 *   const canProceed = await rateLimiter.check('api-call', 5, 60000); // 5 calls per 60 seconds
 *   if (canProceed) {
 *     // Make API call
 *   }
 */

import { logger } from '@/lib/logging/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if an action is allowed
   * @param key - Unique identifier for the rate limit (e.g., 'api-call', 'user-id-123')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      logger.debug('Rate limit check passed', { key, count: 1, maxRequests });
      return true;
    }

    if (entry.count >= maxRequests) {
      const timeUntilReset = Math.ceil((entry.resetTime - now) / 1000);
      logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        maxRequests,
        resetIn: `${timeUntilReset}s`,
      });
      return false;
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);
    logger.debug('Rate limit check passed', {
      key,
      count: entry.count,
      maxRequests,
    });
    return true;
  }

  /**
   * Check and throw error if rate limited
   */
  enforce(key: string, maxRequests: number, windowMs: number): void {
    if (!this.check(key, maxRequests, windowMs)) {
      const entry = this.limits.get(key);
      const timeUntilReset = entry
        ? Math.ceil((entry.resetTime - Date.now()) / 1000)
        : 0;
      throw new Error(
        `Rate limit exceeded. Try again in ${timeUntilReset} seconds.`
      );
    }
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return Math.ceil((entry.resetTime - Date.now()) / 1000);
  }

  /**
   * Reset a specific rate limit
   */
  reset(key: string): void {
    this.limits.delete(key);
    logger.debug('Rate limit reset', { key });
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
    logger.debug('All rate limits reset');
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Create a rate-limited function wrapper
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  maxRequests: number,
  windowMs: number
): T {
  return ((...args: Parameters<T>) => {
    rateLimiter.enforce(key, maxRequests, windowMs);
    return fn(...args);
  }) as T;
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(key: string, maxRequests: number, windowMs: number) {
  const check = () => rateLimiter.check(key, maxRequests, windowMs);
  const enforce = () => rateLimiter.enforce(key, maxRequests, windowMs);
  const getRemaining = () => rateLimiter.getRemaining(key, maxRequests);
  const getTimeUntilReset = () => rateLimiter.getTimeUntilReset(key);
  const reset = () => rateLimiter.reset(key);

  return {
    check,
    enforce,
    getRemaining,
    getTimeUntilReset,
    reset,
  };
}
