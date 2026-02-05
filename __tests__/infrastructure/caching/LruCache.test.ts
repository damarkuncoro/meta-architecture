import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LruCache } from '../../../src/infrastructure/caching/LruCache';

describe('LruCache', () => {
  let cache: LruCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new LruCache({
      maxSize: 3,
      defaultTtl: 1000 // 1 second
    });
  });

  it('should set and get values', async () => {
    await cache.set('key1', 'value1');
    const value = await cache.get('key1');
    expect(value).toBe('value1');
  });

  it('should return null for missing keys', async () => {
    const value = await cache.get('missing');
    expect(value).toBeNull();
  });

  it('should evict least recently used items when full', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.set('key3', 'value3');

    // Access key1 so it becomes most recently used
    await cache.get('key1');

    // Add key4, should evict key2 (least recently used)
    await cache.set('key4', 'value4');

    expect(await cache.get('key1')).toBe('value1');
    expect(await cache.get('key2')).toBeNull(); // Evicted
    expect(await cache.get('key3')).toBe('value3');
    expect(await cache.get('key4')).toBe('value4');
  });

  it('should expire items after TTL', async () => {
    await cache.set('key1', 'value1');
    
    // Advance time by 1.1 seconds
    vi.advanceTimersByTime(1100);

    const value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('should delete items', async () => {
    await cache.set('key1', 'value1');
    await cache.delete('key1');
    const value = await cache.get('key1');
    expect(value).toBeNull();
  });

  it('should clear all items', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.clear();
    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });
});
