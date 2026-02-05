import { describe, it, expect } from 'vitest';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';

describe('ContractVariant', () => {
  it('should create valid variant', () => {
    const variant = ContractVariant.create({
      name: 'size',
      type: 'size',
      values: ['sm', 'md', 'lg'],
      defaultValue: 'md'
    });

    expect(variant.name).toBe('size');
    expect(variant.type).toBe('size');
    expect(variant.values).toEqual(['sm', 'md', 'lg']);
    expect(variant.defaultValue).toBe('md');
  });

  it('should throw error if values is empty', () => {
    expect(() => ContractVariant.create({
      name: 'size',
      type: 'size',
      values: []
    })).toThrow('Variant must have at least one value');
  });

  it('should throw error if defaultValue is not in values', () => {
    expect(() => ContractVariant.create({
      name: 'size',
      type: 'size',
      values: ['sm', 'md'],
      defaultValue: 'xl'
    })).toThrow('Default value must be one of the allowed values');
  });
});
