import { ICache } from '../../domain/services/caching/interfaces';
import { LruCache } from './LruCache';

/**
 * Cache configuration factory
 */
export class CacheConfigFactory {
  /**
   * Create cache config for development
   */
  static development(): { cache: ICache; ttl: number } {
    return {
      cache: new LruCache({
        maxSize: 100,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        defaultTtl: 2 * 60 * 1000, // 2 minutes
        cleanupInterval: 30 * 1000, // 30 seconds
        enableStats: true
      }),
      ttl: 2 * 60 * 1000
    };
  }

  /**
   * Create cache config for production
   */
  static production(): { cache: ICache; ttl: number } {
    return {
      cache: new LruCache({
        maxSize: 10000,
        maxSizeBytes: 500 * 1024 * 1024, // 500MB
        defaultTtl: 10 * 60 * 1000, // 10 minutes
        cleanupInterval: 5 * 60 * 1000, // 5 minutes
        enableStats: true
      }),
      ttl: 10 * 60 * 1000
    };
  }

  /**
   * Create cache config for high-performance scenarios
   */
  static highPerformance(): { cache: ICache; ttl: number } {
    return {
      cache: new LruCache({
        maxSize: 50000,
        maxSizeBytes: 2 * 1024 * 1024 * 1024, // 2GB
        defaultTtl: 30 * 60 * 1000, // 30 minutes
        cleanupInterval: 10 * 60 * 1000, // 10 minutes
        enableStats: false // Disable stats for performance
      }),
      ttl: 30 * 60 * 1000
    };
  }
}
