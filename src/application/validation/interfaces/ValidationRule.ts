import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationContext } from './ValidationContext';

export interface ValidationRule<T = any> {
  name: string;
  description: string;
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  validate: (target: T, context: ValidationContext) => Promise<ValidationError | null>;
}
