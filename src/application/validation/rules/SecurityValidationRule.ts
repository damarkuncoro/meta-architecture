import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule } from '../interfaces';

/**
 * Security Validation Rule
 * Validates contract for security vulnerabilities
 */
export class SecurityValidationRule implements ValidationRule<ContractEntity> {
  name = 'security-validation';
  description = 'Validates contract for security vulnerabilities';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'security';
  severity: 'error' | 'warning' | 'info' = 'error';

  async validate(contract: ContractEntity): Promise<ValidationError | null> {
    // Check for potentially dangerous default values
    for (const prop of contract.props) {
      if (prop.name.includes('password') && prop.defaultValue) {
        return new ValidationError(
          `Property '${prop.name}' appears to be a password field but has a default value`,
          'INSECURE_DEFAULT_PASSWORD',
          { propName: prop.name }
        );
      }
    }
    return null;
  }
}
