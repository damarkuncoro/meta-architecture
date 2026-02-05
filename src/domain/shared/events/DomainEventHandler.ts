import { DomainEvent } from './DomainEvent';

/**
 * Domain event handler interface
 */
export interface DomainEventHandler {
  handle(event: DomainEvent): Promise<void> | void;
}
