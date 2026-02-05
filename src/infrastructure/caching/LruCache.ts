import { 
  ICache, 
  CacheEntry, 
  CacheStats,
  CacheConfig 
} from '../../domain/services/caching/interfaces';

/**
 * LRU (Least Recently Used) Cache Implementation
 * Evicts least recently accessed items when cache is full
 */
export class LruCache<T = any> implements ICache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Set<string>(); // For LRU tracking
  private config: Required<CacheConfig>;
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    evictions: 0,
    expirations: 0,
    totalAccessTime: 0,
    accessCount: 0
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      maxSizeBytes: config.maxSizeBytes ?? 50 * 1024 * 1024, // 50MB
      defaultTtl: config.defaultTtl ?? 5 * 60 * 1000, // 5 minutes
      cleanupInterval: config.cleanupInterval ?? 60 * 1000, // 1 minute
      enableStats: config.enableStats ?? true
    };

    this.startCleanupTimer();
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<T | null> {
    const startTime = this.config.enableStats ? Date.now() : 0;

    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) {
        this.stats.totalMisses++;
      }
      // Emit cache miss event (in a real implementation)
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      await this.delete(key);
      if (this.config.enableStats) {
        this.stats.totalMisses++;
        this.stats.expirations++;
      }
      return null;
    }

    // Update access order for LRU
    this.accessOrder.delete(key);
    this.accessOrder.add(key);

    // Update entry metadata
    entry.hits++;
    entry.lastAccessed = Date.now();

    if (this.config.enableStats) {
      this.stats.totalHits++;
      this.stats.totalAccessTime += Date.now() - startTime;
      this.stats.accessCount++;
    }

    return entry.value;
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const effectiveTtl = ttl ?? this.config.defaultTtl;
    const size = this.estimateSize(value);

    // Check size limits before setting
    if (size > this.config.maxSizeBytes) {
      throw new Error(`Value size ${size} exceeds maximum cache entry size ${this.config.maxSizeBytes}`);
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.accessOrder.delete(key);
      this.cache.delete(key);
    }

    // Evict entries if necessary
    await this.evictIfNecessary(size);

    // Create new entry
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      ttl: effectiveTtl,
      hits: 0,
      lastAccessed: now,
      size
    };

    this.cache.set(key, entry);
    this.accessOrder.add(key);

    // Emit cache set event (in a real implementation)
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      // Emit cache delete event (in a real implementation)
    }
    return existed;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      await this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder.clear();
    this.resetStats();
  }

  /**
   * Get cache size (number of entries)
   */
  async size(): Promise<number> {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const hitRate = totalRequests > 0 ? this.stats.totalHits / totalRequests : 0;

    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    const averageAccessTime = this.stats.accessCount > 0
      ? this.stats.totalAccessTime / this.stats.accessCount
      : 0;

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      hitRate,
      totalSize,
      averageAccessTime,
      evictions: this.stats.evictions,
      expirations: this.stats.expirations
    };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Set cache configuration
   */
  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart cleanup timer if interval changed
    if (config.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        await this.delete(key);
        cleanedCount++;
        if (this.config.enableStats) {
          this.stats.expirations++;
        }
      }
    }

    // Emit cleanup event (in a real implementation)
    return cleanedCount;
  }

  /**
   * Close cache and cleanup resources
   */
  async close(): Promise<void> {
    this.stopCleanupTimer();
    await this.clear();
  }

  // Private methods

  private isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private async evictIfNecessary(newEntrySize: number): Promise<void> {
    // Check size limits
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    // Evict by size if necessary
    if (currentSize + newEntrySize > this.config.maxSizeBytes) {
      await this.evictBySize(currentSize + newEntrySize - this.config.maxSizeBytes);
    }

    // Evict by count if necessary
    if (this.cache.size >= this.config.maxSize) {
      await this.evictByCount(1);
    }
  }

  private async evictBySize(bytesToFree: number): Promise<void> {
    let freedBytes = 0;
    const entriesToDelete: string[] = [];

    // Sort by last accessed (LRU) and collect entries to evict
    const sortedEntries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    for (const [key, entry] of sortedEntries) {
      entriesToDelete.push(key);
      freedBytes += entry.size;

      if (freedBytes >= bytesToFree) break;
    }

    // Delete collected entries
    for (const key of entriesToDelete) {
      await this.delete(key);
      if (this.config.enableStats) {
        this.stats.evictions++;
      }
      // Emit eviction event (in a real implementation)
    }
  }

  private async evictByCount(count: number): Promise<void> {
    // Get least recently used entries
    const entriesToDelete = Array.from(this.accessOrder).slice(0, count);

    for (const key of entriesToDelete) {
      await this.delete(key);
      if (this.config.enableStats) {
        this.stats.evictions++;
      }
      // Emit eviction event (in a real implementation)
    }
  }

  private estimateSize(value: T): number {
    // Rough estimation - in a real implementation, use a more accurate method
    if (value === null || value === undefined) return 8;
    if (typeof value === 'string') return value.length * 2;
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 1;
    if (Array.isArray(value)) {
      return value.reduce((sum, item) => sum + this.estimateSize(item), 16); // 16 for array overhead
    }
    if (typeof value === 'object') {
      return Object.keys(value).reduce((sum, key) => {
        return sum + key.length * 2 + this.estimateSize((value as any)[key]);
      }, 32); // 32 for object overhead
    }
    return 16; // Default size
  }

  private startCleanupTimer(): void {
    // Timer functionality disabled for now to avoid Node.js dependencies
    // In a real implementation, you would use setInterval/clearInterval
    // this.cleanupTimer = setInterval(async () => {
    //   await this.cleanup();
    // }, this.config.cleanupInterval);
  }

  private stopCleanupTimer(): void {
    // Timer functionality disabled for now to avoid Node.js dependencies
    // if (this.cleanupTimer) {
    //   clearInterval(this.cleanupTimer);
    //   this.cleanupTimer = undefined;
    // }
  }

  private resetStats(): void {
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      evictions: 0,
      expirations: 0,
      totalAccessTime: 0,
      accessCount: 0
    };
  }
}