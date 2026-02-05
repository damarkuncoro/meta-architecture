// Infrastructure Layer - External Concerns Implementation
// This layer contains concrete implementations of interfaces defined in the domain

export { InMemoryContractRepository } from './repositories/InMemoryContractRepository';
export { CachedContractRepository } from './repositories/CachedContractRepository';
export { IDomainEventPublisher, DomainEventHandler, DomainEvent } from '../domain/shared/events';
export { InMemoryDomainEventPublisher, inMemoryDomainEventPublisher } from './events/InMemoryDomainEventPublisher';

// Caching Infrastructure
export * from './caching';

// Security Infrastructure
export * from './security';

// Health Monitoring
export * from './health';
