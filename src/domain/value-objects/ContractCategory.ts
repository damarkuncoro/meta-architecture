import { ValueObject } from '../shared/ValueObject';
import { VALID_CONTRACT_CATEGORIES } from '../../schemas/ContractCategories';

/**
 * Contract Category Value Object
 * Defines the category/type of a contract
 */
export class ContractCategory extends ValueObject {
  static readonly UI_COMPONENT = new ContractCategory('ui.component');
  static readonly UI_LAYOUT = new ContractCategory('ui.layout');
  static readonly DOMAIN_MODEL = new ContractCategory('domain.model');
  static readonly DOMAIN_RULE = new ContractCategory('domain.rule');
  static readonly WORKFLOW = new ContractCategory('workflow');
  static readonly SERVICE = new ContractCategory('service');

  private constructor(private readonly _value: string) {
    super();
  }

  static get VALID_VALUES(): string[] {
    return [...VALID_CONTRACT_CATEGORIES];
  }

  /**
   * Creates a ContractCategory from string
   */
  static fromString(value: string): ContractCategory {
    const normalized = value.toLowerCase();

    // 1. Check known static instances & backward compatibility
    switch (normalized) {
      case 'ui.component': return ContractCategory.UI_COMPONENT;
      case 'ui.layout': return ContractCategory.UI_LAYOUT;
      case 'domain.model': return ContractCategory.DOMAIN_MODEL;
      case 'domain.rule': return ContractCategory.DOMAIN_RULE;
      case 'workflow': return ContractCategory.WORKFLOW;
      case 'service': return ContractCategory.SERVICE;
      // Backward compatibility mapping
      case 'component': return ContractCategory.UI_COMPONENT;
      case 'business': return ContractCategory.DOMAIN_RULE;
    }

    // 2. Validate against schema definition
    // This allows the Domain to support new categories defined in Schema
    // without requiring immediate code changes here (Open/Closed Principle)
    if ((ContractCategory.VALID_VALUES as string[]).includes(normalized)) {
      return new ContractCategory(normalized);
    }

    throw new Error(`Invalid contract category: ${value}. Must be one of: ${ContractCategory.VALID_VALUES.join(', ')}`);
  }

  get value(): string {
    return this._value;
  }

  protected getEqualityProperties(): any[] {
    return [this._value];
  }

  toString(): string {
    return `ContractCategory(${this._value})`;
  }
}