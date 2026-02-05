import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../../../src/infrastructure/security/InputSanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should pass valid string without rules', () => {
      const result = InputSanitizer.sanitizeString('valid string');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('valid string');
    });

    it('should fail for non-string input', () => {
      const result = InputSanitizer.sanitizeString(123 as any);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('INVALID_TYPE');
    });

    it('should enforce maxLength', () => {
      const result = InputSanitizer.sanitizeString('12345', { maxLength: 3 });
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('INPUT_TOO_LONG');
    });

    it('should allow string within maxLength', () => {
      const result = InputSanitizer.sanitizeString('123', { maxLength: 3 });
      expect(result.isSuccess).toBe(true);
    });

    it('should enforce allowedPatterns', () => {
      const rules = { allowedPatterns: [/^[0-9]+$/] };
      const validResult = InputSanitizer.sanitizeString('123', rules);
      const invalidResult = InputSanitizer.sanitizeString('abc', rules);

      expect(validResult.isSuccess).toBe(true);
      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.error.code).toBe('PATTERN_NOT_ALLOWED');
    });

    it('should enforce blockedPatterns', () => {
      const rules = { blockedPatterns: [/<script/i] };
      const validResult = InputSanitizer.sanitizeString('plain text', rules);
      const invalidResult = InputSanitizer.sanitizeString('<script>alert(1)</script>', rules);

      expect(validResult.isSuccess).toBe(true);
      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.error.code).toBe('PATTERN_BLOCKED');
    });

    it('should enforce customValidators', () => {
      const rules = { 
        customValidators: [(s: string) => s.startsWith('valid')] 
      };
      const validResult = InputSanitizer.sanitizeString('valid input', rules);
      const invalidResult = InputSanitizer.sanitizeString('invalid input', rules);

      expect(validResult.isSuccess).toBe(true);
      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.error.code).toBe('CUSTOM_VALIDATION_FAILED');
    });
  });

  describe('sanitizeObject', () => {
    it('should pass valid object without rules', () => {
      const result = InputSanitizer.sanitizeObject({ key: 'value' });
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ key: 'value' });
    });

    it('should fail for non-object input', () => {
      const result = InputSanitizer.sanitizeObject('string' as any);
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('INVALID_TYPE');
    });

    it('should enforce maxDepth', () => {
      const deepObject = { a: { b: { c: { d: 1 } } } };
      
      const result = InputSanitizer.sanitizeObject(deepObject, { maxDepth: 2 });
      
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('OBJECT_TOO_DEEP');
    });

    it('should allow object within maxDepth', () => {
      const object = { a: { b: 1 } };
      
      const result = InputSanitizer.sanitizeObject(object, { maxDepth: 2 });
      
      expect(result.isSuccess).toBe(true);
    });
  });
});
