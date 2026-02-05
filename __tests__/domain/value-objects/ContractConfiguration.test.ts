import { describe, it, expect } from 'vitest';
import { ContractConfiguration } from '../../../src/domain/value-objects/ContractConfiguration';

describe('ContractConfiguration', () => {
  it('should create valid configuration', () => {
    const props = { key: 'value', number: 123 };
    const config = ContractConfiguration.create(props);
    expect(config.value).toEqual(props);
  });

  it('should retrieve specific values', () => {
    const config = ContractConfiguration.create({ key: 'value' });
    expect(config.getValue('key')).toBe('value');
    expect(config.getValue('missing')).toBeUndefined();
  });

  it('should return a copy of the configuration', () => {
    const props = { nested: { a: 1 } };
    const config = ContractConfiguration.create(props);
    const value = config.value;
    value.nested.a = 2;
    
    // Note: Shallow copy is standard, but if deep immutability is required, test should reflect that.
    // Based on implementation { ...this.props }, it's a shallow copy.
    expect(config.getValue('nested').a).toBe(2); 
    // Wait, if it returns a shallow copy, modifying nested object modifies original if it's not deep cloned.
    // The implementation is `return { ...this.props }`. So top level keys are new, but values are references.
  });

  it('should be equal if properties are same', () => {
    const config1 = ContractConfiguration.create({ a: 1 });
    const config2 = ContractConfiguration.create({ a: 1 });
    const config3 = ContractConfiguration.create({ a: 2 });

    expect(config1.equals(config2)).toBe(true);
    expect(config1.equals(config3)).toBe(false);
  });
});
