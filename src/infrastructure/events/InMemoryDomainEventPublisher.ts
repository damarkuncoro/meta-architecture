import { IDomainEventPublisher, DomainEventHandler, DomainEvent } from '../../domain/shared/events';

/**
 * In-Memory Domain Event Publisher
 * Simple implementation for development and testing
 */
export class InMemoryDomainEventPublisher implements IDomainEventPublisher {
  private handlers = new Map<string, DomainEventHandler[]>();
  private publishedEvents: DomainEvent[] = [];

  /**
   * Publish a domain event to all registered handlers
   */
  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);

    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    // Publish to all handlers asynchronously
    const publishPromises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        // Log error but don't fail the entire publish operation
        // In a real application, you would use a proper logging framework
        this.logError(`Error in domain event handler for ${eventType}:`, error);
      }
    });

    await Promise.all(publishPromises);
  }

  /**
   * Subscribe to domain events
   */
  subscribe(eventType: string, handler: DomainEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribe from domain events
   */
  unsubscribe(eventType: string, handler: DomainEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get all published events (for testing/debugging)
   */
  getPublishedEvents(): readonly DomainEvent[] {
    return [...this.publishedEvents];
  }

  /**
   * Get published events of specific type
   */
  getPublishedEventsOfType(eventType: string): DomainEvent[] {
    return this.publishedEvents.filter(event => event.constructor.name === eventType);
  }

  /**
   * Clear published events (for testing)
   */
  clearPublishedEvents(): void {
    this.publishedEvents = [];
  }

  /**
   * Get subscription statistics
   */
  getSubscriptionStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [eventType, handlers] of this.handlers.entries()) {
      stats[eventType] = handlers.length;
    }
    return stats;
  }

  /**
   * Reset publisher state (for testing)
   */
  reset(): void {
    this.handlers.clear();
    this.publishedEvents = [];
  }

  /**
   * Simple error logging (in production, use proper logging framework)
   */
  private logError(message: string, error: any): void {
    // In a real application, you would inject a logger
    // For now, we'll just store the error for debugging
    this.publishedEvents.push({
      constructor: { name: 'ErrorEvent' },
      message,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    } as any);
  }
}

/**
 * Global instance for application use
 */
export const inMemoryDomainEventPublisher = new InMemoryDomainEventPublisher();