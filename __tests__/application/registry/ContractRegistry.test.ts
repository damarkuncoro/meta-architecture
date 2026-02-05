import { describe, it, expect, beforeEach } from 'vitest';
import { ContractRegistry } from '../../../src/application/registry/ContractRegistry';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractName } from '../../../src/domain/value-objects/ContractName';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractValidation } from '../../../src/domain/entities/ContractValidation';

describe('ContractRegistry', () => {
  let registry: ContractRegistry;
  let repository: InMemoryContractRepository;

  beforeEach(() => {
    repository = new InMemoryContractRepository();
    // @ts-ignore - Accessing private constructor for test isolation
    registry = new ContractRegistry(repository);
  });

  const createContract = (id: string, name: string) => {
    return ContractEntity.create({
      id,
      name: name,
      category: ContractCategory.fromString('ui.component'),
      variants: [ContractVariant.create({ 
        name: 'size',
        type: 'size',
        values: ['sm', 'md', 'lg'],
        defaultValue: 'md'
      })],
      props: [ContractProp.create({
        name: 'label',
        type: 'string',
        required: true,
        description: 'Button label'
      })],
      validation: []
    });
  };

  it('should register a contract', async () => {
    const contract = createContract('c1', 'Contract-1');
    const result = await registry.register(contract);

    expect(result.isSuccess).toBe(true);
    
    // Verify in repo
    const saved = await repository.findById('c1');
    expect(saved).toBeDefined();
    expect(saved?.id).toBe('c1');
  });

  it('should prevent duplicate registration', async () => {
    const contract = createContract('c1', 'Contract-1');
    await registry.register(contract);

    const result = await registry.register(contract);
    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONTRACT_ALREADY_REGISTERED');
  });

  it('should unregister a contract', async () => {
    const contract = createContract('c1', 'Contract-1');
    await registry.register(contract);

    const result = await registry.unregister('c1');
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(true);

    const saved = await repository.findById('c1');
    expect(saved).toBeNull();
  });

  it('should handle unregistering non-existent contract', async () => {
    const result = await registry.unregister('missing');
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(false);
  });

  describe('Retrieval', () => {
    it('should get contract by ID', async () => {
      const contract = createContract('c1', 'Contract-1');
      await registry.register(contract);

      const result = await registry.getById('c1');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBe('c1');
    });

    it('should return null for non-existent ID', async () => {
      const result = await registry.getById('missing');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should get contract by name', async () => {
      const contract = createContract('c1', 'Contract-1');
      await registry.register(contract);

      const result = await registry.getByName('Contract-1');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBe('c1');
    });

    it('should get contracts by category', async () => {
      const contract1 = createContract('c1', 'Contract-1');
      const contract2 = createContract('c2', 'Contract-2');
      await registry.register(contract1);
      await registry.register(contract2);

      const result = await registry.getByCategory('ui.component');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it('should get all contracts', async () => {
      const contract1 = createContract('c1', 'Contract-1');
      const contract2 = createContract('c2', 'Contract-2');
      await registry.register(contract1);
      await registry.register(contract2);

      const result = await registry.getAll();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it('should check if contract exists', async () => {
      const contract = createContract('c1', 'Contract-1');
      await registry.register(contract);

      const exists = await registry.exists('c1');
      expect(exists.isSuccess).toBe(true);
      expect(exists.value).toBe(true);

      const missing = await registry.exists('missing');
      expect(missing.isSuccess).toBe(true);
      expect(missing.value).toBe(false);
    });
  });

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = ContractRegistry.getInstance(repository);
      const instance2 = ContractRegistry.getInstance(repository);
      expect(instance1).toBe(instance2);
    });
  });
});
