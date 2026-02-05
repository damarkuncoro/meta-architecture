import { SchemaValidationError } from './SchemaValidationError';
import { SchemaValidationWarning } from './SchemaValidationWarning';

export interface SchemaValidationResult {
  isValid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}
