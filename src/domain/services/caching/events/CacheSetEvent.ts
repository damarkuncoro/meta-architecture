import { CacheEvent } from './CacheEvent';

export class CacheSetEvent extends CacheEvent {
  constructor(key: string, size: number, ttl?: number) {
    super('cache_set', key, Date.now(), { size, ttl });
  }
}
