import { ICache } from './ICache';
import { CacheConfig } from './CacheConfig';

/**
 * Cache factory for creating cache instances
 */
export interface ICacheFactory {
  createMemoryCache<T = any>(config?: CacheConfig): ICache<T>;
  createLruCache<T = any>(config?: CacheConfig): ICache<T>;
  createTtlCache<T = any>(config?: CacheConfig): ICache<T>;
  createMultiLevelCache<T = any>(caches: ICache<T>[]): ICache<T>;
}
