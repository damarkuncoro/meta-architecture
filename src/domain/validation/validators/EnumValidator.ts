import { IPropValidator } from '../IPropValidator';

/**
 * Validates enum constraints
 */
export class EnumValidator implements IPropValidator {
  /**
   * Validates if value is in enum list
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (!rules || !rules.enum || !Array.isArray(rules.enum)) {
      return errors;
    }

    if (!rules.enum.includes(value)) {
      errors.push(`Property '${propName}' must be one of: ${rules.enum.join(', ')}`);
    }

    return errors;
  }
}
