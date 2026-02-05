import { describe, it, expect } from 'vitest';
import { CacheConfigFactory } from '../../../src/infrastructure/caching/CacheConfigFactory';
import { LruCache } from '../../../src/infrastructure/caching/LruCache';

describe('CacheConfigFactory', () => {
  it('should create development config', () => {
    const config = CacheConfigFactory.development();
    
    expect(config.ttl).toBe(2 * 60 * 1000);
    expect(config.cache).toBeInstanceOf(LruCache);
    
    // Verify cache settings indirectly via exposed properties or behavior if possible
    // For now checking type and ttl is sufficient as factory is a simple builder
  });

  it('should create production config', () => {
    const config = CacheConfigFactory.production();
    
    expect(config.ttl).toBe(10 * 60 * 1000);
    expect(config.cache).toBeInstanceOf(LruCache);
  });

  it('should create high performance config', () => {
    const config = CacheConfigFactory.highPerformance();
    
    expect(config.ttl).toBe(30 * 60 * 1000);
    expect(config.cache).toBeInstanceOf(LruCache);
  });
});
