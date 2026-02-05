import { describe, it, expect } from 'vitest';
import { ContractValidation, ValidationRule } from '../../../src/domain/entities/ContractValidation';

describe('ContractValidation', () => {
  it('should create with rules array', () => {
    const rules: ValidationRule[] = [
      { type: 'required', target: 'prop1' },
      { type: 'range', target: 'prop2', params: { min: 1, max: 10 } }
    ];
    const validation = ContractValidation.create(rules);

    expect(validation.rules).toHaveLength(2);
    expect(validation.hasValidation).toBe(true);
  });

  it('should create with object params', () => {
    const rules: ValidationRule[] = [
      { type: 'pattern', target: 'email', params: { regex: '^.+@.+$' } }
    ];
    const validation = ContractValidation.create({ rules });

    expect(validation.rules).toHaveLength(1);
    expect(validation.rules[0].type).toBe('pattern');
  });

  it('should create empty validation by default', () => {
    const validation = ContractValidation.create();
    expect(validation.rules).toHaveLength(0);
    expect(validation.hasValidation).toBe(false);
  });

  it('should extract custom validator script', () => {
    const script = 'return value > 0;';
    const validation = ContractValidation.create([
      { type: 'custom', target: 'amount', params: { script } }
    ]);

    expect(validation.customValidator).toBe(script);
  });

  it('should return undefined if no custom validator', () => {
    const validation = ContractValidation.create([{ type: 'required', target: 'id' }]);
    expect(validation.customValidator).toBeUndefined();
  });

  it('should be equal to same configuration', () => {
    const rules: ValidationRule[] = [{ type: 'required', target: 'id' }];
    const v1 = ContractValidation.create(rules);
    const v2 = ContractValidation.create(rules);

    expect(v1.equals(v2)).toBe(true);
  });
});
