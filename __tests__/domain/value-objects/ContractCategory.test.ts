import { describe, it, expect } from 'vitest';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';

describe('ContractCategory', () => {
  it('should create valid categories', () => {
    expect(ContractCategory.fromString('ui.component')).toEqual(ContractCategory.UI_COMPONENT);
    expect(ContractCategory.fromString('ui.layout')).toEqual(ContractCategory.UI_LAYOUT);
    expect(ContractCategory.fromString('domain.model')).toEqual(ContractCategory.DOMAIN_MODEL);
    expect(ContractCategory.fromString('domain.rule')).toEqual(ContractCategory.DOMAIN_RULE);
    expect(ContractCategory.fromString('workflow')).toEqual(ContractCategory.WORKFLOW);
    expect(ContractCategory.fromString('service')).toEqual(ContractCategory.SERVICE);
  });

  it('should handle backward compatibility', () => {
    expect(ContractCategory.fromString('component')).toEqual(ContractCategory.UI_COMPONENT);
    expect(ContractCategory.fromString('business')).toEqual(ContractCategory.DOMAIN_RULE);
  });

  it('should throw error for invalid categories', () => {
    expect(() => ContractCategory.fromString('invalid')).toThrow('Invalid contract category');
  });

  it('should be case insensitive', () => {
    expect(ContractCategory.fromString('UI.COMPONENT')).toEqual(ContractCategory.UI_COMPONENT);
  });

  it('should return correct string representation', () => {
    expect(ContractCategory.UI_COMPONENT.toString()).toBe('ContractCategory(ui.component)');
  });
});
