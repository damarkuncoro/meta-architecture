import { describe, it, expect } from 'vitest';
import { ContractProp } from '../../../src/domain/entities/ContractProp';

describe('ContractProp', () => {
  it('should create valid prop', () => {
    const prop = ContractProp.create({
      name: 'label',
      type: 'string',
      required: true,
      description: 'Button label'
    });

    expect(prop.name).toBe('label');
    expect(prop.type).toBe('string');
    expect(prop.required).toBe(true);
  });

  it('should default required to false', () => {
    const prop = ContractProp.create({
      name: 'label',
      type: 'string'
    });
    expect(prop.required).toBe(false);
  });

  it('should throw error for invalid creation', () => {
    expect(() => ContractProp.create({ name: '', type: 'string' })).toThrow('Prop name must be a non-empty string');
    expect(() => ContractProp.create({ name: 'label', type: '' })).toThrow('Prop type must be specified');
  });
});
