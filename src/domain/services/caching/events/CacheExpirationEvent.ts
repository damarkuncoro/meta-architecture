import { CacheEvent } from './CacheEvent';

export class CacheExpirationEvent extends CacheEvent {
  constructor(key: string) {
    super('cache_expiration', key);
  }
}
