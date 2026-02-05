import { IPropValidator } from '../IPropValidator';

/**
 * Validates object properties
 */
export class ObjectValidator implements IPropValidator {
  /**
   * Validates an object value
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property
   */
  validate(value: any, _rules: Record<string, any> | undefined, propName: string): string[] {
    const errors: string[] = [];

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push(`Property '${propName}' must be an object`);
      return errors;
    }

    // Future: Add nested object validation if needed (e.g. required keys)
    // For now, we just validate it is a non-null object

    return errors;
  }
}
