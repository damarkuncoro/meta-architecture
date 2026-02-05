import { IPropValidator } from '../IPropValidator';

/**
 * Validates string properties
 */
export class StringValidator implements IPropValidator {
  /**
   * Validates a string value
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (typeof value !== 'string') {
      errors.push(`Property '${propName}' must be a string`);
      return errors;
    }

    if (!rules) {
      return errors;
    }

    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`Property '${propName}' length must be at least ${rules.minLength}`);
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`Property '${propName}' length must be at most ${rules.maxLength}`);
    }

    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push(`Property '${propName}' format is invalid (must match ${rules.pattern})`);
        }
      } catch (e) {
        // Ignore invalid regex in schema for now
      }
    }

    return errors;
  }
}
