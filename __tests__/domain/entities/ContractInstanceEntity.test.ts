import { describe, it, expect } from 'vitest';
import { ContractInstanceEntity } from '../../../src/domain/entities/ContractInstanceEntity';
import { ContractConfiguration } from '../../../src/domain/value-objects/ContractConfiguration';

describe('ContractInstanceEntity', () => {
  it('should create valid instance', () => {
    const config = ContractConfiguration.create({ theme: 'dark' });
    const instance = ContractInstanceEntity.create('contract-123', config);

    expect(instance.contractId).toBe('contract-123');
    expect(instance.configuration).toEqual(config);
    expect(instance.id).toMatch(/^instance-/);
  });
});
