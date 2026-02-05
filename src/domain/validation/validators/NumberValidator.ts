import { IPropValidator } from '../IPropValidator';

/**
 * Validates number properties
 */
export class NumberValidator implements IPropValidator {
  /**
   * Validates a number value
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (typeof value !== 'number') {
      errors.push(`Property '${propName}' must be a number`);
      return errors;
    }

    if (!rules) {
      return errors;
    }

    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Property '${propName}' must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Property '${propName}' must be at most ${rules.max}`);
    }

    if (rules.integer && !Number.isInteger(value)) {
      errors.push(`Property '${propName}' must be an integer`);
    }

    return errors;
  }
}
