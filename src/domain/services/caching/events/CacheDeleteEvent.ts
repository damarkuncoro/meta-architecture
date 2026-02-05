import { CacheEvent } from './CacheEvent';

export class CacheDeleteEvent extends CacheEvent {
  constructor(key: string) {
    super('cache_delete', key);
  }
}
