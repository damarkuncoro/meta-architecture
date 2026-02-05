import { SanitizationRules } from '../../domain/services/security/interfaces';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string, rules: SanitizationRules = {}): Result<string, ValidationError> {
    if (typeof input !== 'string') {
      return Result.failure(ValidationError.invalidType('string', typeof input));
    }

    let sanitized = input;

    // Length limits
    if (rules.maxLength && sanitized.length > rules.maxLength) {
      return Result.failure(new ValidationError(
        `String exceeds maximum length of ${rules.maxLength}`,
        'INPUT_TOO_LONG',
        { maxLength: rules.maxLength, actualLength: sanitized.length }
      ));
    }

    // Pattern filtering
    if (rules.allowedPatterns) {
      const allowed = rules.allowedPatterns.some(pattern => pattern.test(sanitized));
      if (!allowed) {
        return Result.failure(new ValidationError(
          'String does not match allowed patterns',
          'PATTERN_NOT_ALLOWED'
        ));
      }
    }

    if (rules.blockedPatterns) {
      const blocked = rules.blockedPatterns.some(pattern => pattern.test(sanitized));
      if (blocked) {
        return Result.failure(new ValidationError(
          'String contains blocked patterns',
          'PATTERN_BLOCKED'
        ));
      }
    }

    // Custom validators
    if (rules.customValidators) {
      for (const validator of rules.customValidators) {
        if (!validator(sanitized)) {
          return Result.failure(new ValidationError(
            'String failed custom validation',
            'CUSTOM_VALIDATION_FAILED'
          ));
        }
      }
    }

    return Result.success(sanitized);
  }

  /**
   * Sanitize object input
   */
  static sanitizeObject(input: any, rules: SanitizationRules = {}): Result<any, ValidationError> {
    if (typeof input !== 'object' || input === null) {
      return Result.failure(ValidationError.invalidType('object', typeof input));
    }

    // Depth limits
    if (rules.maxDepth) {
      const depth = this.calculateDepth(input);
      if (depth > rules.maxDepth) {
        return Result.failure(new ValidationError(
          `Object exceeds maximum depth of ${rules.maxDepth}`,
          'OBJECT_TOO_DEEP',
          { maxDepth: rules.maxDepth, actualDepth: depth }
        ));
      }
    }

    // Type validation
    if (rules.allowedTypes) {
      const isAllowed = this.validateObjectTypes(input, rules.allowedTypes);
      if (!isAllowed) {
        return Result.failure(new ValidationError(
          'Object contains disallowed types',
          'INVALID_OBJECT_TYPES',
          { allowedTypes: rules.allowedTypes }
        ));
      }
    }

    return Result.success(input);
  }

  private static calculateDepth(obj: any, currentDepth = 0): number {
    if (typeof obj !== 'object' || obj === null) return currentDepth;

    let maxDepth = currentDepth;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        maxDepth = Math.max(maxDepth, this.calculateDepth(value, currentDepth + 1));
      }
    }
    return maxDepth;
  }

  private static validateObjectTypes(obj: any, allowedTypes: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) return false;

    for (const value of Object.values(obj)) {
      const type = typeof value;
      if (!allowedTypes.includes(type)) {
        if (type === 'object' && value !== null) {
          if (!this.validateObjectTypes(value, allowedTypes)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
    return true;
  }
}
