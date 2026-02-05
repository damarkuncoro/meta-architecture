import { ValueObject } from '../shared/ValueObject';
import { PropValidatorFactory } from '../validation/PropValidatorFactory';
import { EnumValidator } from '../validation/validators/EnumValidator';

/**
 * Contract Prop Entity
 * Represents a property definition for a contract
 */
export class ContractProp extends ValueObject {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly required: boolean,
    public readonly defaultValue?: any,
    public readonly description?: string,
    public readonly validation?: Record<string, any>
  ) {
    super();
    this.validate();
  }

  /**
   * Creates a ContractProp
   */
  static create(params: {
    name: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    description?: string;
    validation?: Record<string, any>;
  }): ContractProp {
    return new ContractProp(
      params.name,
      params.type,
      params.required || false,
      params.defaultValue,
      params.description,
      params.validation
    );
  }

  /**
   * Validates the prop
   */
  private validate(): void {
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Prop name must be a non-empty string');
    }

    if (!this.type || typeof this.type !== 'string') {
      throw new Error('Prop type must be specified');
    }

    if (this.required && this.defaultValue !== undefined) {
      throw new Error('Required props cannot have default values');
    }
  }

  /**
   * Validates a value against the property rules
   * @param value The value to validate
   * @returns Array of error messages, or empty array if valid
   */
  validateValue(value: any): string[] {
    const errors: string[] = [];

    // 1. Validate Type & Type-specific Rules
    const typeValidator = PropValidatorFactory.getValidator(this.type);
    errors.push(...typeValidator.validate(value, this.validation, this.name));

    // 2. Validate Enum (Universal Rule)
    // Only run if no type errors to avoid noise, or run anyway?
    // Original code ran enum validation separately.
    // But if type is wrong, enum check might be irrelevant or fail?
    // The EnumValidator checks if value is in array.
    
    // Optimizing: If we have type errors, we might want to return early?
    // Original code returned early on type mismatch.
    if (errors.length > 0) {
        return errors; 
    }

    const enumValidator = new EnumValidator();
    errors.push(...enumValidator.validate(value, this.validation, this.name));

    return errors;
  }

  /**
   * Checks if the prop has a default value
   */
  hasDefaultValue(): boolean {
    return this.defaultValue !== undefined;
  }

  /**
   * Gets the default value
   */
  getDefaultValue(): any {
    return this.defaultValue;
  }

  protected getEqualityProperties(): any[] {
    return [this.name, this.type, this.required, this.defaultValue, this.description, this.validation];
  }

  toString(): string {
    return `ContractProp(${this.name}: ${this.type})`;
  }
}