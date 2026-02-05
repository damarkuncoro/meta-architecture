import { IPropValidator } from '../IPropValidator';

/**
 * Validates boolean properties
 */
export class BooleanValidator implements IPropValidator {
  /**
   * Validates a boolean value
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, _rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (typeof value !== 'boolean') {
      errors.push(`Property '${propName}' must be a boolean`);
    }

    return errors;
  }
}
