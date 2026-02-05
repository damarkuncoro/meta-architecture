import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContractRegistry } from '../../../src/application/registry/ContractRegistry';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { InMemoryDomainEventPublisher } from '../../../src/infrastructure/events/InMemoryDomainEventPublisher';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractRegisteredEvent, ContractUnregisteredEvent, ContractLookupEvent } from '../../../src/domain/events/registry';

describe('ContractRegistry Integration Tests', () => {
  let registry: ContractRegistry;
  let repository: InMemoryContractRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let testContract: ContractEntity;
  let testContract2: ContractEntity;

  beforeEach(async () => {
    repository = new InMemoryContractRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    registry = new ContractRegistry(repository, eventPublisher);

    // Create test contracts
    testContract = ContractEntity.create({
      name: 'button-component',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'size', type: 'size', values: ['sm', 'md'] })],
      props: [ContractProp.create({ name: 'label', type: 'string' })]
    });

    testContract2 = ContractEntity.create({
      name: 'card-component',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'intent', type: 'intent', values: ['default', 'outlined'] })],
      props: [ContractProp.create({ name: 'title', type: 'string' })]
    });
  });

  afterEach(async () => {
    registry.clear();
    eventPublisher.clearPublishedEvents();
  });

  describe('Registration Lifecycle', () => {
    it('should successfully register a valid contract', async () => {
      const result = await registry.register(testContract);

      expect(result.isSuccess).toBe(true);

      // Verify contract is registered locally
      const stats = registry.getStats();
      expect(stats.totalContracts).toBe(1);
      expect(stats.categories['ui.component']).toBe(1);

      // Verify event was published
      const events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ContractRegisteredEvent);
      expect((events[0] as ContractRegisteredEvent).contractId).toBe(testContract.id);
    });

    it('should prevent duplicate registration', async () => {
      // Register first time
      await registry.register(testContract);
      expect((await registry.register(testContract)).isFailure).toBe(true);
      expect((await registry.register(testContract)).error.code).toBe('CONTRACT_ALREADY_REGISTERED');
    });

    it('should validate contract before registration', async () => {
      const invalidContract = { ...testContract, id: '' } as any;

      const result = await registry.register(invalidContract);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('REQUIRED_FIELD_MISSING');
    });

    it('should handle repository errors during registration', async () => {
      vi.spyOn(repository, 'save').mockRejectedValue(new Error('DB Error'));

      const result = await registry.register(testContract);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('REGISTRATION_ERROR');
    });
  });

  describe('Unregistration Lifecycle', () => {
    it('should successfully unregister a registered contract', async () => {
      // Register first
      await registry.register(testContract);
      expect(registry.getStats().totalContracts).toBe(1);

      // Unregister
      const result = await registry.unregister(testContract.id);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);

      // Verify contract is removed
      expect(registry.getStats().totalContracts).toBe(0);

      // Verify event was published
      const events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(2); // register + unregister
      expect(events[1]).toBeInstanceOf(ContractUnregisteredEvent);
    });

    it('should return false for non-existent contract unregistration', async () => {
      const result = await registry.unregister('non-existent-id');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(false);
    });

    it('should handle repository errors during unregistration', async () => {
      await registry.register(testContract);
      vi.spyOn(repository, 'delete').mockRejectedValue(new Error('DB Error'));

      const result = await registry.unregister(testContract.id);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('UNREGISTRATION_ERROR');
    });
  });

  describe('Contract Lookup Operations', () => {
    beforeEach(async () => {
      await registry.register(testContract);
      await registry.register(testContract2);
    });

    it('should find contract by ID from local cache', async () => {
      const result = await registry.getById(testContract.id);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(testContract.id);

      // Verify lookup event
      const events = eventPublisher.getPublishedEvents();
      const lookupEvents = events.filter(e => e instanceof ContractLookupEvent);
      expect(lookupEvents).toHaveLength(1);
      expect((lookupEvents[0] as ContractLookupEvent).result).toBe('found');
    });

    it('should find contract by ID from repository when not in cache', async () => {
      // Clear local cache
      registry.clear();

      const result = await registry.getById(testContract.id);
      expect(result.isSuccess).toBe(true);
      expect(result.value?.id).toBe(testContract.id);

      // Should now be in local cache
      expect(registry.getStats().totalContracts).toBe(1);
    });

    it('should return null for non-existent contract by ID', async () => {
      const result = await registry.getById('non-existent-id');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should find contract by name', async () => {
      const result = await registry.getByName('button-component');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.name.value).toBe('button-component');
    });

    it('should find contract by name from repository when not in cache', async () => {
      registry.clear();

      const result = await registry.getByName('button-component');
      expect(result.isSuccess).toBe(true);
      expect(result.value?.name.value).toBe('button-component');
    });

    it('should return null for non-existent contract by name', async () => {
      const result = await registry.getByName('non-existent-name');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should get contracts by category', async () => {
      const result = await registry.getByCategory('ui.component');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
      expect(result.value.map(c => c.name.value)).toEqual(
        expect.arrayContaining(['button-component', 'card-component'])
      );
    });

    it('should return empty array for category with no contracts', async () => {
      const result = await registry.getByCategory('workflow');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(0);
    });

    it('should get all contracts', async () => {
      const result = await registry.getAll();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it('should get active contracts only', async () => {
      // Make one contract active
      testContract.markAsValidated();
      testContract.approve();
      testContract.activate();

      const result = await registry.getActive();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value[0].status.isActive).toBe(true);
    });

    it('should check contract existence', async () => {
      await registry.register(testContract);

      // Exists in registry
      let result = await registry.exists(testContract.id);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);

      // Verify contract was saved to repository
      const saved = await repository.findById(testContract.id);
      expect(saved).toBeDefined();

      // Exists in repository but not registry (using name-based check)
      registry.clear();
      // Note: registry.exists uses name-based lookup due to repository interface
      result = await registry.exists(testContract.name.value);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);

      // Doesn't exist
      result = await registry.exists('non-existent-name');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(false);
    });
  });

  describe('Registry Management', () => {
    it('should refresh registry from repository', async () => {
      // Register contracts
      await registry.register(testContract);
      await registry.register(testContract2);

      // Clear local state
      registry.clear();
      expect(registry.getStats().totalContracts).toBe(0);

      // Refresh
      const result = await registry.refresh();
      expect(result.isSuccess).toBe(true);

      // Should reload all contracts
      expect(registry.getStats().totalContracts).toBe(2);
    });

    it('should provide accurate statistics', async () => {
      await registry.register(testContract);
      await registry.register(testContract2);

      // Make one active
      testContract.markAsValidated();
      testContract.approve();
      testContract.activate();

      const stats = registry.getStats();

      expect(stats.totalContracts).toBe(2);
      expect(stats.activeContracts).toBe(1);
      expect(stats.categories['ui.component']).toBe(2);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should handle category indexing correctly', async () => {
      // Register contracts in same category
      await registry.register(testContract);
      await registry.register(testContract2);

      // Register contract in different category
      const workflowContract = ContractEntity.create({
        name: 'workflow-process',
        category: ContractCategory.WORKFLOW,
        variants: [ContractVariant.create({ name: 'tone', type: 'tone', values: ['async'] })],
        props: [ContractProp.create({ name: 'steps', type: 'array' })]
      });
      await registry.register(workflowContract);

      const stats = registry.getStats();
      expect(stats.categories['ui.component']).toBe(2);
      expect(stats.categories['workflow']).toBe(1);
    });
  });

  describe('Event Publishing', () => {
    it('should publish events for all registry operations', async () => {
      // Register
      await registry.register(testContract);
      let events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ContractRegisteredEvent);

      // Lookup by ID
      await registry.getById(testContract.id);
      events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(ContractLookupEvent);

      // Lookup by name
      await registry.getByName('button-component');
      events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(3);

      // Unregister
      await registry.unregister(testContract.id);
      events = eventPublisher.getPublishedEvents();
      expect(events).toHaveLength(4);
      expect(events[3]).toBeInstanceOf(ContractUnregisteredEvent);
    });

    it('should handle missing event publisher gracefully', async () => {
      const registryWithoutPublisher = new ContractRegistry(repository);

      // Should work without throwing
      const result = await registryWithoutPublisher.register(testContract);
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle repository errors during lookup operations', async () => {
      vi.spyOn(repository, 'findById').mockRejectedValue(new Error('DB Error'));

      const result = await registry.getById('any-id');
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONTRACT_LOOKUP_ERROR');
    });

    it('should handle repository errors during category lookup', async () => {
      vi.spyOn(repository, 'findByCategory').mockRejectedValue(new Error('DB Error'));

      const result = await registry.getByCategory('ui.component');
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONTRACT_LOOKUP_ERROR');
    });

    it('should handle repository errors during getAll', async () => {
      vi.spyOn(repository, 'findAll').mockRejectedValue(new Error('DB Error'));

      const result = await registry.getAll();
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONTRACT_LOOKUP_ERROR');
    });

    it('should handle repository errors during exists check', async () => {
      vi.spyOn(repository, 'exists').mockRejectedValue(new Error('DB Error'));

      const result = await registry.exists('any-id');
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONTRACT_EXISTS_ERROR');
    });

    it('should handle refresh errors', async () => {
      vi.spyOn(repository, 'findAll').mockRejectedValue(new Error('DB Error'));

      const result = await registry.refresh();
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('REGISTRY_REFRESH_ERROR');
    });
  });

  describe('Singleton Pattern', () => {
    it('should create singleton instance correctly', () => {
      const instance1 = ContractRegistry.getInstance(repository, eventPublisher);
      const instance2 = ContractRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should require repository for first instantiation', () => {
      // Reset singleton
      (ContractRegistry as any).instance = undefined;

      expect(() => ContractRegistry.getInstance()).toThrow('Repository is required');
    });
  });

  describe('Category Management', () => {
    it('should maintain category index correctly during registration/unregistration', async () => {
      // Register two contracts in same category
      await registry.register(testContract);
      await registry.register(testContract2);

      expect(registry.getStats().categories['ui.component']).toBe(2);

      // Unregister one
      await registry.unregister(testContract.id);
      expect(registry.getStats().categories['ui.component']).toBe(1);

      // Unregister second
      await registry.unregister(testContract2.id);
      expect(registry.getStats().categories['ui.component']).toBeUndefined();
    });

    it('should handle repository data during refresh', async () => {
      await registry.register(testContract);

      // Simulate repository returning updated data
      const updatedContract = ContractEntity.create({
        name: 'updated-contract',
        category: ContractCategory.DOMAIN_MODEL,
        variants: [ContractVariant.create({ name: 'size', type: 'size', values: ['sm'] })],
        props: [ContractProp.create({ name: 'label', type: 'string' })]
      });

      vi.spyOn(repository, 'findAll').mockResolvedValue([updatedContract]);

      await registry.refresh();

      const stats = registry.getStats();
      expect(stats.categories['domain.model']).toBe(1);
      expect(stats.categories['ui.component']).toBeUndefined();
    });
  });
});