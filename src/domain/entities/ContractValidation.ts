import { ValueObject } from '../shared/ValueObject';

export interface ValidationRule {
  type: 'required' | 'range' | 'pattern' | 'custom';
  target: string;
  params?: any;
}

/**
 * Contract Validation Value Object
 * Defines validation rules and schema for a contract
 */
export class ContractValidation extends ValueObject {
  constructor(
    public readonly rules: ValidationRule[]
  ) {
    super();
  }

  /**
   * Creates a ContractValidation instance
   */
  static create(params: Partial<ContractValidation> | ValidationRule[] = []): ContractValidation {
    if (Array.isArray(params)) {
      return new ContractValidation(params);
    }
    return new ContractValidation(params.rules || []);
  }

  /**
   * Checks if validation is configured
   */
  get hasValidation(): boolean {
    return this.rules.length > 0;
  }

  /**
   * Helper to get custom validator script
   * Used by ValidationPipeline for backward compatibility/convenience
   */
  get customValidator(): string | undefined {
    const customRule = this.rules.find(r => r.type === 'custom');
    return customRule?.params?.script;
  }

  protected getEqualityProperties(): any[] {
    return [this.rules];
  }

  toString(): string {
    return `ContractValidation(rules: ${this.rules.length})`;
  }
}
