/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
  hits: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
}
