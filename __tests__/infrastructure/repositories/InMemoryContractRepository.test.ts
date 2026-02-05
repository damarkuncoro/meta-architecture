import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';

describe('InMemoryContractRepository', () => {
  let repository: InMemoryContractRepository;
  let contract: ContractEntity;

  beforeEach(() => {
    repository = new InMemoryContractRepository(10);
    
    contract = ContractEntity.create({
      name: 'test-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v1', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p1', type: 'string' })]
    });
  });

  it('should save and find contract by id', async () => {
    await repository.save(contract);
    const found = await repository.findById(contract.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(contract.id);
  });

  it('should find contract by name', async () => {
    await repository.save(contract);
    const found = await repository.findByName('test-contract');
    expect(found).toBeDefined();
    expect(found?.name.value).toBe('test-contract');
  });

  it('should return null for non-existent contract', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
  });

  it('should find all contracts', async () => {
    await repository.save(contract);
    const all = await repository.findAll();
    expect(all.length).toBe(1);
  });

  it('should find contracts by category', async () => {
    await repository.save(contract);
    const found = await repository.findByCategory('ui.component');
    expect(found.length).toBe(1);
    
    const notFound = await repository.findByCategory('workflow');
    expect(notFound.length).toBe(0);
  });

  it('should find active contracts', async () => {
    await repository.save(contract);
    
    // Default status is DRAFT
    let active = await repository.findActive();
    expect(active.length).toBe(0);

    // Transition to ACTIVE
    contract.markAsValidated();
    contract.approve();
    contract.activate();
    
    // Note: repository stores object reference in this implementation, so changes reflect immediately.
    // In real DB, we'd need to save again.
    
    active = await repository.findActive();
    expect(active.length).toBe(1);
  });

  it('should delete contract', async () => {
    await repository.save(contract);
    await repository.delete(contract.id);
    const found = await repository.findById(contract.id);
    expect(found).toBeNull();
  });

  it('should check existence by name', async () => {
    await repository.save(contract);
    expect(await repository.exists('test-contract')).toBe(true);
    expect(await repository.exists('other')).toBe(false);
  });

  it('should respect max contracts limit', async () => {
    const smallRepo = new InMemoryContractRepository(1);
    await smallRepo.save(contract);
    
    const secondContract = ContractEntity.create({
      name: 'test-2',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v1', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p1', type: 'string' })]
    });

    await expect(smallRepo.save(secondContract)).rejects.toThrow('Maximum contract limit');
  });

  it('should provide correct stats', async () => {
    await repository.save(contract);
    const stats = repository.getStats();
    
    expect(stats.totalContracts).toBe(1);
    expect(stats.activeContracts).toBe(0);
    expect(stats.categories['ui.component']).toBe(1);
  });
});
