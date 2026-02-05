/**
 * Cache configuration
 */
export interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  maxSizeBytes?: number; // Maximum size in bytes
  defaultTtl?: number; // Default TTL in milliseconds
  cleanupInterval?: number; // Cleanup interval in milliseconds
  enableStats?: boolean;
}
