import { CacheEvent } from './CacheEvent';

export class CacheMissEvent extends CacheEvent {
  constructor(key: string) {
    super('cache_miss', key);
  }
}
