import { describe, it, expect } from 'vitest';
import { ContractName } from '../../../src/domain/value-objects/ContractName';

describe('ContractName', () => {
  it('should create valid contract name', () => {
    const name = ContractName.create('valid-contract_name');
    expect(name.value).toBe('valid-contract_name');
  });

  it('should throw error for empty name', () => {
    expect(() => ContractName.create('')).toThrow('Contract name must be a non-empty string');
    expect(() => ContractName.create('   ')).toThrow('Contract name cannot be empty or whitespace only');
  });

  it('should throw error for name exceeding length limit', () => {
    const longName = 'a'.repeat(101);
    expect(() => ContractName.create(longName)).toThrow('Contract name cannot exceed 100 characters');
  });

  it('should throw error for invalid characters', () => {
    expect(() => ContractName.create('invalid name')).toThrow('Contract name can only contain letters, numbers, hyphens, and underscores');
    expect(() => ContractName.create('name@123')).toThrow('Contract name can only contain letters, numbers, hyphens, and underscores');
  });

  it('should return correct string representation', () => {
    const name = ContractName.create('test-contract');
    expect(name.toString()).toBe('ContractName(test-contract)');
  });
});
