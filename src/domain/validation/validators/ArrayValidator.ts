import { IPropValidator } from '../IPropValidator';

/**
 * Validates array properties
 */
export class ArrayValidator implements IPropValidator {
  /**
   * Validates an array value
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
      errors.push(`Property '${propName}' must be an array`);
      return errors;
    }

    if (!rules) {
      return errors;
    }

    if (rules.minItems !== undefined && value.length < rules.minItems) {
      errors.push(`Property '${propName}' must contain at least ${rules.minItems} items`);
    }

    if (rules.maxItems !== undefined && value.length > rules.maxItems) {
      errors.push(`Property '${propName}' must contain at most ${rules.maxItems} items`);
    }

    if (rules.uniqueItems) {
      const unique = new Set(value.map(v => JSON.stringify(v)));
      if (unique.size !== value.length) {
        errors.push(`Property '${propName}' must contain unique items`);
      }
    }

    return errors;
  }
}
