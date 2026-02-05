/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSize: number; // Estimated total size in bytes
  averageAccessTime: number;
  evictions: number;
  expirations: number;
}
