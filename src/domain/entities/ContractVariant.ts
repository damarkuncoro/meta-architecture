import { ValueObject } from '../shared/ValueObject';

/**
 * Contract Variant Entity
 * Represents a variant configuration for a contract
 */
export class ContractVariant extends ValueObject {
  constructor(
    public readonly name: string,
    public readonly type: 'size' | 'intent' | 'tone' | 'emphasis' | 'custom',
    public readonly values: any[],
    public readonly defaultValue?: any,
    public readonly description?: string
  ) {
    super();
    this.validate();
  }

  /**
   * Creates a ContractVariant
   */
  static create(params: {
    name: string;
    type: 'size' | 'intent' | 'tone' | 'emphasis' | 'custom';
    values: any[];
    defaultValue?: any;
    description?: string;
  }): ContractVariant {
    return new ContractVariant(
      params.name,
      params.type,
      params.values,
      params.defaultValue,
      params.description
    );
  }

  /**
   * Validates the variant
   */
  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Variant name must be a non-empty string');
    }

    if (!this.values || !Array.isArray(this.values) || this.values.length === 0) {
      throw new Error('Variant must have at least one value');
    }

    if (this.defaultValue !== undefined && !this.values.includes(this.defaultValue)) {
      throw new Error('Default value must be one of the allowed values');
    }
  }

  /**
   * Checks if a value is supported by this variant
   */
  supportsValue(value: any): boolean {
    return this.values.includes(value);
  }

  protected getEqualityProperties(): any[] {
    return [this.name, this.type, this.values, this.defaultValue, this.description];
  }

  toString(): string {
    return `ContractVariant(${this.name}: ${this.type})`;
  }
}