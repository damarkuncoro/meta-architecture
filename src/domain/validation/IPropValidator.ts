/**
 * Interface for property validators
 */
export interface IPropValidator {
  /**
   * Validates a value against specific rules
   * @param value The value to validate
   * @param rules Validation rules
   * @param propName Name of the property for error messages
   * @returns Array of error messages
   */
  validate(value: any, rules: Record<string, any> | undefined, propName: string): string[];
}
