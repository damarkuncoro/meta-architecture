import { IPropValidator } from './IPropValidator';
import { BooleanValidator } from './validators/BooleanValidator';
import { NumberValidator } from './validators/NumberValidator';
import { StringValidator } from './validators/StringValidator';
import { ArrayValidator } from './validators/ArrayValidator';
import { ObjectValidator } from './validators/ObjectValidator';

/**
 * Factory for creating property validators
 */
export class PropValidatorFactory {
  private static validators: Record<string, IPropValidator> = {
    'number': new NumberValidator(),
    'string': new StringValidator(),
    'boolean': new BooleanValidator(),
    'array': new ArrayValidator(),
    'object': new ObjectValidator(),
  };

  /**
   * Gets a validator for the specified type
   * @param type The property type
   * @returns The validator instance
   */
  static getValidator(type: string): IPropValidator {
    const validator = this.validators[type];
    if (!validator) {
      // Default validator for unknown types
      return {
        validate: () => []
      };
    }
    return validator;
  }
}
