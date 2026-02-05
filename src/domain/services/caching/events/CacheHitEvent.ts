import { CacheEvent } from './CacheEvent';

export class CacheHitEvent extends CacheEvent {
  constructor(key: string, accessTime: number) {
    super('cache_hit', key, Date.now(), { accessTime });
  }
}
