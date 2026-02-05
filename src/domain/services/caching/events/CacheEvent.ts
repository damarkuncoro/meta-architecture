/**
 * Cache events for monitoring
 */
export class CacheEvent {
  constructor(
    public readonly eventType: string,
    public readonly key: string,
    public readonly timestamp: number = Date.now(),
    public readonly metadata?: Record<string, any>
  ) {}
}
