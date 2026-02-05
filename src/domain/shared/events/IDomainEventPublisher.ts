import { DomainEvent } from './DomainEvent';
import { DomainEventHandler } from './DomainEventHandler';

/**
 * Domain event publisher interface
 * Defines the contract for publishing domain events
 */
export interface IDomainEventPublisher {
  /**
   * Publish a domain event to all registered handlers
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Subscribe to domain events of a specific type
   */
  subscribe(eventType: string, handler: DomainEventHandler): void;

  /**
   * Unsubscribe from domain events
   */
  unsubscribe(eventType: string, handler: DomainEventHandler): void;
}
