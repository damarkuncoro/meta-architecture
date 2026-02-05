import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LruCache } from '../../../src/infrastructure/caching/LruCache';

describe('LruCache Integration Tests', () => {
  let cache: LruCache<string>;

  beforeEach(() => {
    cache = new LruCache<string>({
      maxSize: 3,
      maxSizeBytes: 100,
      defaultTtl: 1000, // 1 second for testing
      enableStats: true
    });
  });

  afterEach(async () => {
    await cache.close();
  });

  describe('LRU Eviction by Count', () => {
    it('should evict least recently used items when max size is reached', async () => {
      // Fill cache to max size
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      // Access key1 to make it most recently used
      await cache.get('key1');

      // Add fourth item, should evict key2 (least recently used)
      await cache.set('key4', 'value4');

      expect(await cache.has('key1')).toBe(true);
      expect(await cache.has('key2')).toBe(false); // Evicted
      expect(await cache.has('key3')).toBe(true);
      expect(await cache.has('key4')).toBe(true);
      expect(await cache.size()).toBe(3);
    });

    it('should maintain access order correctly', async () => {
      await cache.set('a', '1');
      await cache.set('b', '2');
      await cache.set('c', '3');

      // Access pattern: a, c, a, b
      await cache.get('a'); // a becomes most recent
      await cache.get('c'); // c becomes most recent
      await cache.get('a'); // a becomes most recent
      await cache.get('b'); // b becomes most recent

      // Add d, should evict c (least recently used)
      await cache.set('d', '4');

      expect(await cache.has('a')).toBe(true);
      expect(await cache.has('b')).toBe(true);
      expect(await cache.has('c')).toBe(false); // Evicted
      expect(await cache.has('d')).toBe(true);
    });
  });

  describe('Size-based Eviction', () => {
    it('should evict items when memory limit is exceeded', async () => {
      const smallCache = new LruCache<string>({
        maxSize: 10,
        maxSizeBytes: 20, // Very small limit
        enableStats: true
      });

      // Each string is ~10 bytes, so second item should trigger eviction
      await smallCache.set('key1', 'value12345'); // ~15 bytes
      await smallCache.set('key2', 'value67890'); // ~15 bytes, exceeds limit

      const stats = await smallCache.getStats();
      expect(stats.evictions).toBeGreaterThan(0);
      expect(await smallCache.size()).toBe(1);

      await smallCache.close();
    });

    it('should reject items that exceed max entry size', async () => {
      const tinyCache = new LruCache<string>({
        maxSize: 10,
        maxSizeBytes: 5, // 5 bytes max per entry
        enableStats: true
      });

      await expect(tinyCache.set('key1', 'this is too long')).rejects.toThrow('exceeds maximum cache entry size');

      await tinyCache.close();
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire items after TTL', async () => {
      const fastCache = new LruCache<string>({
        maxSize: 10,
        defaultTtl: 50, // 50ms TTL
        enableStats: true
      });

      await fastCache.set('key1', 'value1');
      expect(await fastCache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(await fastCache.get('key1')).toBeNull();
      expect(await fastCache.has('key1')).toBe(false);

      const stats = await fastCache.getStats();
      expect(stats.expirations).toBe(1);

      await fastCache.close();
    });

    it('should support custom TTL per entry', async () => {
      await cache.set('short', 'value1', 50); // 50ms
      await cache.set('long', 'value2', 200); // 200ms

      // After 75ms, short should be expired, long should still work
      await new Promise(resolve => setTimeout(resolve, 75));

      expect(await cache.get('short')).toBeNull();
      expect(await cache.get('long')).toBe('value2');
    });

    it('should cleanup expired entries', async () => {
      const cleanupCache = new LruCache<string>({
        maxSize: 10,
        defaultTtl: 50,
        enableStats: true
      });

      await cleanupCache.set('key1', 'value1');
      await cleanupCache.set('key2', 'value2');

      await new Promise(resolve => setTimeout(resolve, 60));

      const cleaned = await cleanupCache.cleanup();
      expect(cleaned).toBe(2);

      expect(await cleanupCache.size()).toBe(0);

      await cleanupCache.close();
    });
  });

  describe('Statistics and Performance', () => {
    it('should track cache hits and misses accurately', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      // Hits
      await cache.get('key1');
      await cache.get('key1');
      await cache.get('key2');

      // Misses
      await cache.get('nonexistent');
      await cache.get('nonexistent');

      const stats = await cache.getStats();
      expect(stats.totalHits).toBe(3);
      expect(stats.totalMisses).toBe(2);
      expect(stats.hitRate).toBe(3 / 5);
    });

    it('should calculate memory usage correctly', async () => {
      await cache.set('key1', 'short');
      await cache.set('key2', 'this is a longer string');

      const stats = await cache.getStats();
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.totalEntries).toBe(2);
    });

    it('should track access statistics', async () => {
      const statsCache = new LruCache<string>({
        maxSize: 10,
        enableStats: true
      });

      await statsCache.set('key1', 'value1');
      await statsCache.set('key2', 'value2');

      // Perform accesses
      await statsCache.get('key1'); // hit
      await statsCache.get('key1'); // hit
      await statsCache.get('nonexistent'); // miss

      const stats = await statsCache.getStats();
      expect(stats.totalHits).toBe(2);
      expect(stats.totalMisses).toBe(1);
      expect(stats.hitRate).toBe(2/3);
      expect(stats.totalEntries).toBe(2);

      await statsCache.close();
    });
  });

  describe('Configuration Management', () => {
    it('should allow configuration changes', async () => {
      const configCache = new LruCache<string>({ maxSize: 5 });

      expect(configCache.getConfig().maxSize).toBe(5);

      configCache.setConfig({ maxSize: 10, defaultTtl: 2000 });

      const newConfig = configCache.getConfig();
      expect(newConfig.maxSize).toBe(10);
      expect(newConfig.defaultTtl).toBe(2000);

      await configCache.close();
    });

    it('should handle stats disable/enable', async () => {
      const statsCache = new LruCache<string>({ enableStats: false });

      await statsCache.set('key1', 'value1');
      await statsCache.get('key1');

      const stats = await statsCache.getStats();
      // Stats should be zero when disabled
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);

      await statsCache.close();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty keys and values', async () => {
      await cache.set('', 'empty key');
      await cache.set('empty value', '');

      expect(await cache.get('')).toBe('empty key');
      expect(await cache.get('empty value')).toBe('');
    });

    it('should handle null and undefined values', async () => {
      await cache.set('null', null as any);
      await cache.set('undefined', undefined as any);

      expect(await cache.get('null')).toBeNull();
      expect(await cache.get('undefined')).toBeUndefined();
    });

    it('should handle sequential operations with eviction', async () => {
      const evictingCache = new LruCache<string>({
        maxSize: 2, // Very small for testing
        enableStats: true
      });

      // Fill cache
      await evictingCache.set('key1', 'value1');
      await evictingCache.set('key2', 'value2');

      // Access key1 to make it recently used
      await evictingCache.get('key1');

      // Add third item - should evict key2 (least recently used)
      await evictingCache.set('key3', 'value3');

      expect(await evictingCache.has('key1')).toBe(true);
      expect(await evictingCache.has('key2')).toBe(false); // Should be evicted
      expect(await evictingCache.has('key3')).toBe(true);

      const stats = await evictingCache.getStats();
      expect(stats.evictions).toBe(1);

      await evictingCache.close();
    });

    it('should handle large objects in size estimation', async () => {
      const objectCache = new LruCache<any>({
        maxSize: 10,
        maxSizeBytes: 10000,
        enableStats: true
      });

      const largeObject = {
        data: 'x'.repeat(1000),
        nested: {
          array: new Array(100).fill('item'),
          deep: {
            value: 'deep value'
          }
        }
      };

      await objectCache.set('large', largeObject);
      const stats = await objectCache.getStats();

      expect(stats.totalSize).toBeGreaterThan(1000); // Should account for large content

      await objectCache.close();
    });
  });

  describe('Lifecycle Management', () => {
    it('should clear all data on clear()', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      expect(await cache.size()).toBe(2);

      await cache.clear();

      expect(await cache.size()).toBe(0);
      const stats = await cache.getStats();
      expect(stats.totalEntries).toBe(0);
    });

    it('should return all keys correctly', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      const keys = await cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should handle delete operations correctly', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      const deleted = await cache.delete('key1');
      expect(deleted).toBe(true);

      const deletedAgain = await cache.delete('key1');
      expect(deletedAgain).toBe(false);

      expect(await cache.has('key1')).toBe(false);
      expect(await cache.has('key2')).toBe(true);
    });
  });
});