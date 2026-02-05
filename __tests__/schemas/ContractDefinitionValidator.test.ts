import { describe, it, expect } from 'vitest';
import { ContractDefinitionValidator } from '../../src/schemas/ContractDefinitionValidator';

describe('ContractDefinitionValidator', () => {
  const validDefinition = {
    id: 'ui.component.button',
    name: 'button',
    category: 'ui.component',
    status: 'draft',
    version: '1.0.0',
    variants: [
      {
        name: 'size',
        type: 'size',
        values: ['sm', 'md'],
        defaultValue: 'md'
      }
    ],
    props: [
      {
        name: 'label',
        type: 'string',
        required: true
      }
    ],
    accessibility: {
      supported: true,
      roles: ['button'],
      keyboardActions: ['enter', 'space']
    },
    validation: [
      {
        type: 'required',
        target: 'label'
      }
    ]
  };

  it('should validate a correct definition', () => {
    const result = ContractDefinitionValidator.validate(validDefinition);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return error for non-object definition', () => {
    const result = ContractDefinitionValidator.validate(null);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_TYPE');
  });

  it('should return error for missing required fields', () => {
    const invalid = { ...validDefinition };
    delete (invalid as any).name;
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'MISSING_REQUIRED_FIELD')).toBeDefined();
  });

  it('should validate ID format', () => {
    const invalid = { ...validDefinition, id: 'invalid id' };
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'INVALID_ID_FORMAT')).toBeDefined();
  });

  it('should validate name format (kebab-case)', () => {
    const invalid = { ...validDefinition, name: 'Button' }; // Uppercase not allowed
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'INVALID_NAME_FORMAT')).toBeDefined();
  });

  it('should validate category', () => {
    const invalid = { ...validDefinition, category: 'invalid.category' };
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'INVALID_CATEGORY_VALUE')).toBeDefined();
  });

  it('should validate variants uniqueness', () => {
    const invalid = {
      ...validDefinition,
      variants: [
        { name: 'size', type: 'size', values: ['sm'] },
        { name: 'size', type: 'intent', values: ['primary'] }
      ]
    };
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'DUPLICATE_VARIANT_NAME')).toBeDefined();
  });

  it('should validate prop types', () => {
    const invalid = {
      ...validDefinition,
      props: [
        { name: 'label', type: 'invalid-type', required: true }
      ]
    };
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'INVALID_PROP_TYPE')).toBeDefined();
  });

  it('should warn about missing accessibility roles if supported', () => {
    const warningDef = {
      ...validDefinition,
      accessibility: {
        supported: true,
        roles: [] // Empty
      }
    };
    const result = ContractDefinitionValidator.validate(warningDef);
    expect(result.isValid).toBe(true); // Still valid, just warnings
    expect(result.warnings.find(w => w.code === 'MISSING_ACCESSIBILITY_ROLES')).toBeDefined();
  });

  it('should validate custom validation script presence', () => {
    const invalid = {
      ...validDefinition,
      validation: [
        { type: 'custom', target: 'all' } // Missing params.script
      ]
    };
    const result = ContractDefinitionValidator.validate(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.find(e => e.code === 'MISSING_CUSTOM_VALIDATOR_SCRIPT')).toBeDefined();
  });
});
