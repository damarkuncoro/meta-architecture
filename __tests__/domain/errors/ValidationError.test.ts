import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../../src/domain/errors/ValidationError';

describe('ValidationError', () => {
  it('should create basic error', () => {
    const error = new ValidationError('Something went wrong');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  it('should create required field error', () => {
    const error = ValidationError.required('username');
    expect(error.message).toContain("'username' is required");
    expect(error.code).toBe('REQUIRED_FIELD_MISSING');
    expect(error.details?.fieldName).toBe('username');
  });

  it('should create invalid format error', () => {
    const error = ValidationError.invalidFormat('email', 'email address');
    expect(error.message).toContain("invalid format");
    expect(error.code).toBe('INVALID_FORMAT');
    expect(error.details?.expectedFormat).toBe('email address');
  });

  it('should create out of range error', () => {
    const error = ValidationError.outOfRange('age', 150, 0, 120);
    expect(error.message).toContain("between 0 and 120");
    expect(error.code).toBe('OUT_OF_RANGE');
    
    const minError = ValidationError.outOfRange('price', -1, 0);
    expect(minError.message).toContain("at least 0");

    const maxError = ValidationError.outOfRange('score', 101, undefined, 100);
    expect(maxError.message).toContain("at most 100");
  });

  it('should create duplicate error', () => {
    const error = ValidationError.duplicate('email', 'test@example.com');
    expect(error.message).toContain("already exists");
    expect(error.code).toBe('DUPLICATE_VALUE');
  });

  it('should create business rule violation error', () => {
    const error = ValidationError.businessRuleViolation('Account must be active');
    expect(error.message).toContain("Business rule violation");
    expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
  });

  it('should create invalid type error', () => {
    const error = ValidationError.invalidType('string', 'number', 'age');
    expect(error.message).toContain("invalid type");
    expect(error.code).toBe('INVALID_TYPE');
    expect(error.details?.expectedType).toBe('string');
  });
});
