import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InMemoryDomainEventPublisher } from '../../../src/infrastructure/events/InMemoryDomainEventPublisher';
import { DomainEvent, DomainEventHandler } from '../../../src/domain/shared/events';

// Mock event for testing
class TestEvent {
  constructor(public readonly id: string) {}
}

class AnotherTestEvent {
  constructor(public readonly id: string) {}
}

describe('InMemoryDomainEventPublisher', () => {
  let publisher: InMemoryDomainEventPublisher;

  beforeEach(() => {
    publisher = new InMemoryDomainEventPublisher();
  });

  it('should publish event and store it in history', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    
    await publisher.publish(event);

    const publishedEvents = publisher.getPublishedEvents();
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]).toBe(event);
  });

  it('should call registered handlers', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler: DomainEventHandler = {
      handle: vi.fn().mockResolvedValue(undefined)
    };

    publisher.subscribe('TestEvent', handler);
    await publisher.publish(event);

    expect(handler.handle).toHaveBeenCalledTimes(1);
    expect(handler.handle).toHaveBeenCalledWith(event);
  });

  it('should not call handlers for different event types', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler: DomainEventHandler = {
      handle: vi.fn().mockResolvedValue(undefined)
    };

    publisher.subscribe('AnotherTestEvent', handler);
    await publisher.publish(event);

    expect(handler.handle).not.toHaveBeenCalled();
  });

  it('should support multiple handlers for same event', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler1: DomainEventHandler = { handle: vi.fn() };
    const handler2: DomainEventHandler = { handle: vi.fn() };

    publisher.subscribe('TestEvent', handler1);
    publisher.subscribe('TestEvent', handler2);
    await publisher.publish(event);

    expect(handler1.handle).toHaveBeenCalledWith(event);
    expect(handler2.handle).toHaveBeenCalledWith(event);
  });

  it('should unsubscribe handler', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler: DomainEventHandler = { handle: vi.fn() };

    publisher.subscribe('TestEvent', handler);
    publisher.unsubscribe('TestEvent', handler);
    await publisher.publish(event);

    expect(handler.handle).not.toHaveBeenCalled();
  });

  it('should handle handler errors gracefully', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler1: DomainEventHandler = { 
      handle: vi.fn().mockRejectedValue(new Error('Handler error')) 
    };
    const handler2: DomainEventHandler = { handle: vi.fn() };

    // Mock console.error/log to keep test output clean, as the publisher logs errors
    // Note: The implementation calls private logError which likely uses console.error or similar
    // We can't easily mock private method, but we can verify execution continues
    
    publisher.subscribe('TestEvent', handler1);
    publisher.subscribe('TestEvent', handler2);
    
    await publisher.publish(event);

    expect(handler1.handle).toHaveBeenCalled();
    expect(handler2.handle).toHaveBeenCalled(); // Should still be called despite handler1 failing
  });

  it('should filter events by type', async () => {
    const event1 = new TestEvent('1') as unknown as DomainEvent;
    const event2 = new AnotherTestEvent('2') as unknown as DomainEvent;
    const event3 = new TestEvent('3') as unknown as DomainEvent;

    await publisher.publish(event1);
    await publisher.publish(event2);
    await publisher.publish(event3);

    const testEvents = publisher.getPublishedEventsOfType('TestEvent');
    expect(testEvents).toHaveLength(2);
    expect(testEvents[0]).toBe(event1);
    expect(testEvents[1]).toBe(event3);
  });

  it('should clear published events', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    await publisher.publish(event);

    publisher.clearPublishedEvents();

    expect(publisher.getPublishedEvents()).toHaveLength(0);
  });

  it('should reset state', async () => {
    const event = new TestEvent('1') as unknown as DomainEvent;
    const handler: DomainEventHandler = { handle: vi.fn() };

    publisher.subscribe('TestEvent', handler);
    await publisher.publish(event);

    publisher.reset();

    expect(publisher.getPublishedEvents()).toHaveLength(0);
    expect(publisher.getSubscriptionStats()).toEqual({});
    
    // Verify handler is gone
    await publisher.publish(event);
    expect(handler.handle).toHaveBeenCalledTimes(1); // Only the first time
  });
});
