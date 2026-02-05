import { ValueObject } from '../shared/ValueObject';

/**
 * Contract Name Value Object
 * Represents a valid contract name with validation
 */
export class ContractName extends ValueObject {
  private constructor(private readonly _value: string) {
    super();
    this.validate();
  }

  /**
   * Creates a ContractName instance
   */
  static create(value: string): ContractName {
    return new ContractName(value);
  }

  /**
   * Validates the contract name
   */
  private validate(): void {
    if (!this._value || typeof this._value !== 'string') {
      throw new Error('Contract name must be a non-empty string');
    }

    if (this._value.trim().length === 0) {
      throw new Error('Contract name cannot be empty or whitespace only');
    }

    if (this._value.length > 100) {
      throw new Error('Contract name cannot exceed 100 characters');
    }

    // Valid characters: alphanumeric, hyphens, underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(this._value)) {
      throw new Error('Contract name can only contain letters, numbers, hyphens, and underscores');
    }
  }

  get value(): string {
    return this._value;
  }

  protected getEqualityProperties(): any[] {
    return [this._value];
  }

  toString(): string {
    return `ContractName(${this._value})`;
  }
}