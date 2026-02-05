import { CacheEvent } from './CacheEvent';

export class CacheCleanupEvent extends CacheEvent {
  constructor(cleanedEntries: number, duration: number) {
    super('cache_cleanup', '', Date.now(), { cleanedEntries, duration });
  }
}
