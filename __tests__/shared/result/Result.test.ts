import { describe, it, expect } from 'vitest';
import { Result } from '../../../src/shared/result';

describe('Result', () => {
  describe('Success', () => {
    it('should create a success result', () => {
      const result = Result.success<string, Error>('success value');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('success value');
    });

    it('should throw when accessing error', () => {
      const result = Result.success<string, Error>('success value');

      expect(() => result.error).toThrow('Cannot access error of successful result');
    });

    it('should return value for getOrDefault', () => {
      const result = Result.success<string, Error>('success value');

      expect(result.getOrDefault('default')).toBe('success value');
    });

    it('should return value for getOrThrow', () => {
      const result = Result.success<string, Error>('success value');

      expect(result.getOrThrow()).toBe('success value');
    });

    it('should map value', () => {
      const result = Result.success<number, Error>(10);
      const mapped = result.map(x => x * 2);

      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(20);
    });

    it('should flatMap value', () => {
      const result = Result.success<number, Error>(10);
      const flatMapped = result.flatMap(x => Result.success(x * 2));

      expect(flatMapped.isSuccess).toBe(true);
      expect(flatMapped.value).toBe(20);
    });

    it('should not mapError', () => {
      const result = Result.success<string, Error>('success value');
      const mapped = result.mapError(e => new Error('new error'));

      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe('success value');
    });
  });

  describe('Failure', () => {
    it('should create a failure result', () => {
      const error = new Error('failure error');
      const result = Result.failure<string, Error>(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    it('should throw when accessing value', () => {
      const error = new Error('failure error');
      const result = Result.failure<string, Error>(error);

      expect(() => result.value).toThrow('Cannot access value of failed result');
    });

    it('should return default for getOrDefault', () => {
      const error = new Error('failure error');
      const result = Result.failure<string, Error>(error);

      expect(result.getOrDefault('default')).toBe('default');
    });

    it('should throw error for getOrThrow', () => {
      const error = new Error('failure error');
      const result = Result.failure<string, Error>(error);

      expect(() => result.getOrThrow()).toThrow('failure error');
    });

    it('should throw string error for getOrThrow if error is not Error instance', () => {
      const result = Result.failure<string, string>('string error');

      expect(() => result.getOrThrow()).toThrow('string error');
    });

    it('should not map value', () => {
      const error = new Error('failure error');
      const result = Result.failure<number, Error>(error);
      const mapped = result.map(x => x * 2);

      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe(error);
    });

    it('should not flatMap value', () => {
      const error = new Error('failure error');
      const result = Result.failure<number, Error>(error);
      const flatMapped = result.flatMap(x => Result.success(x * 2));

      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe(error);
    });

    it('should mapError', () => {
      const error = new Error('failure error');
      const result = Result.failure<string, Error>(error);
      const mapped = result.mapError(e => new Error('mapped ' + e.message));

      expect(mapped.isFailure).toBe(true);
      expect(mapped.error.message).toBe('mapped failure error');
    });
  });
});
