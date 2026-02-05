import { describe, it, expect } from 'vitest';
import { ArrayValidator } from '../../../src/domain/validation/validators/ArrayValidator';
import { ObjectValidator } from '../../../src/domain/validation/validators/ObjectValidator';
import { PropValidatorFactory } from '../../../src/domain/validation/PropValidatorFactory';

describe('Validators', () => {
  describe('ArrayValidator', () => {
    const validator = new ArrayValidator();

    it('should validate type', () => {
      expect(validator.validate([], {}, 'test')).toEqual([]);
      expect(validator.validate('not array', {}, 'test')).toContain("Property 'test' must be an array");
    });

    it('should validate minItems', () => {
      const rules = { minItems: 2 };
      expect(validator.validate([1, 2], rules, 'test')).toEqual([]);
      expect(validator.validate([1], rules, 'test')).toContain("Property 'test' must contain at least 2 items");
    });

    it('should validate maxItems', () => {
      const rules = { maxItems: 2 };
      expect(validator.validate([1, 2], rules, 'test')).toEqual([]);
      expect(validator.validate([1, 2, 3], rules, 'test')).toContain("Property 'test' must contain at most 2 items");
    });

    it('should validate uniqueItems', () => {
      const rules = { uniqueItems: true };
      expect(validator.validate([1, 2, 3], rules, 'test')).toEqual([]);
      expect(validator.validate([1, 2, 2], rules, 'test')).toContain("Property 'test' must contain unique items");
    });
  });

  describe('ObjectValidator', () => {
    const validator = new ObjectValidator();

    it('should validate type', () => {
      expect(validator.validate({}, {}, 'test')).toEqual([]);
      expect(validator.validate('not object', {}, 'test')).toContain("Property 'test' must be an object");
      expect(validator.validate(null, {}, 'test')).toContain("Property 'test' must be an object");
      expect(validator.validate([], {}, 'test')).toContain("Property 'test' must be an object");
    });
  });

  describe('PropValidatorFactory', () => {
    it('should return correct validator for type', () => {
      expect(PropValidatorFactory.getValidator('array')).toBeInstanceOf(ArrayValidator);
      expect(PropValidatorFactory.getValidator('object')).toBeInstanceOf(ObjectValidator);
    });

    it('should return dummy validator for unknown type', () => {
      const validator = PropValidatorFactory.getValidator('unknown');
      expect(validator.validate('anything', {}, 'test')).toEqual([]);
    });
  });
});
