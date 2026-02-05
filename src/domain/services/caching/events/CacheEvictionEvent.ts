import { CacheEvent } from './CacheEvent';

export class CacheEvictionEvent extends CacheEvent {
  constructor(key: string, reason: string) {
    super('cache_eviction', key, Date.now(), { reason });
  }
}
