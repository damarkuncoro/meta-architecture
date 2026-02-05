import { CacheStats } from './CacheStats';
import { CacheConfig } from './CacheConfig';

/**
 * Cache interface for enterprise caching strategies
 */
export interface ICache<T = any> {
  /**
   * Get a value from cache
   */
  get(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if key exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get cache size (number of entries)
   */
  size(): Promise<number>;

  /**
   * Get all cache keys
   */
  keys(): Promise<string[]>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig;

  /**
   * Set cache configuration
   */
  setConfig(config: Partial<CacheConfig>): void;

  /**
   * Cleanup expired entries
   */
  cleanup(): Promise<number>; // Returns number of cleaned entries

  /**
   * Close cache and cleanup resources
   */
  close(): Promise<void>;
}
