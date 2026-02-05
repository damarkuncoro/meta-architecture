import { ValidationError } from '../../../domain/errors/ValidationError';
import { PerformanceMetrics } from './PerformanceMetrics';
import { SecurityValidationResult } from './SecurityValidationResult';
import { ValidationMetadata } from './ValidationMetadata';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  performance: PerformanceMetrics;
  security: SecurityValidationResult;
  metadata: ValidationMetadata;
}

/**
 * ValidationResult utilities for serialization
 */
export class ValidationResultUtils {
  /**
   * Creates a ValidationResult from JSON data
   */
  static fromJSON(json: any): ValidationResult {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data for ValidationResult');
    }

    // Reconstruct ValidationError objects
    const errors: ValidationError[] = [];
    if (json.errors && Array.isArray(json.errors)) {
      for (const errorData of json.errors) {
        if (errorData && typeof errorData === 'object') {
          errors.push(new ValidationError(
            errorData.message || 'Unknown error',
            errorData.code || 'VALIDATION_ERROR',
            errorData.details
          ));
        }
      }
    }

    const warnings: ValidationError[] = [];
    if (json.warnings && Array.isArray(json.warnings)) {
      for (const warningData of json.warnings) {
        if (warningData && typeof warningData === 'object') {
          warnings.push(new ValidationError(
            warningData.message || 'Unknown warning',
            warningData.code || 'VALIDATION_WARNING',
            warningData.details
          ));
        }
      }
    }

    // Performance metrics are plain objects, can be used directly
    const performance: PerformanceMetrics = json.performance || {};

    // Security result is also plain object
    const security: SecurityValidationResult = json.security || {};

    // Metadata is plain object
    const metadata: ValidationMetadata = json.metadata || {};

    return {
      isValid: json.isValid || false,
      errors,
      warnings,
      performance,
      security,
      metadata
    };
  }

  /**
   * Serializes ValidationResult to JSON
   */
  static toJSON(result: ValidationResult): any {
    return {
      isValid: result.isValid,
      errors: result.errors.map(error => ({
        message: error.message,
        code: error.code,
        details: error.details
      })),
      warnings: result.warnings.map(warning => ({
        message: warning.message,
        code: warning.code,
        details: warning.details
      })),
      performance: result.performance,
      security: result.security,
      metadata: result.metadata
    };
  }
}
