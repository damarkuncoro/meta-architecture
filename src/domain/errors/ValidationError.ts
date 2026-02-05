/**
 * Domain Validation Error
 * Represents validation failures in the domain layer
 */
export class ValidationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }

  /**
   * Create validation error for required field
   */
  static required(fieldName: string): ValidationError {
    return new ValidationError(
      `Field '${fieldName}' is required`,
      'REQUIRED_FIELD_MISSING',
      { fieldName }
    );
  }

  /**
   * Create validation error for invalid format
   */
  static invalidFormat(fieldName: string, expectedFormat: string): ValidationError {
    return new ValidationError(
      `Field '${fieldName}' has invalid format. Expected: ${expectedFormat}`,
      'INVALID_FORMAT',
      { fieldName, expectedFormat }
    );
  }

  /**
   * Create validation error for out of range value
   */
  static outOfRange(fieldName: string, value: any, min?: number, max?: number): ValidationError {
    const range = min !== undefined && max !== undefined
      ? `between ${min} and ${max}`
      : min !== undefined
        ? `at least ${min}`
        : `at most ${max}`;

    return new ValidationError(
      `Field '${fieldName}' value ${value} is out of range. Expected: ${range}`,
      'OUT_OF_RANGE',
      { fieldName, value, min, max }
    );
  }

  /**
   * Create validation error for duplicate value
   */
  static duplicate(fieldName: string, value: any): ValidationError {
    return new ValidationError(
      `Field '${fieldName}' value '${value}' already exists`,
      'DUPLICATE_VALUE',
      { fieldName, value }
    );
  }

  /**
   * Create validation error for business rule violation
   */
  static businessRuleViolation(rule: string, details?: Record<string, any>): ValidationError {
    return new ValidationError(
      `Business rule violation: ${rule}`,
      'BUSINESS_RULE_VIOLATION',
      details
    );
  }

  /**
   * Create validation error for invalid type
   */
  static invalidType(expectedType: string, actualType: string, fieldName?: string): ValidationError {
    const field = fieldName ? `Field '${fieldName}' ` : '';
    return new ValidationError(
      `${field}has invalid type. Expected: ${expectedType}, got: ${actualType}`,
      'INVALID_TYPE',
      { expectedType, actualType, fieldName }
    );
  }
}