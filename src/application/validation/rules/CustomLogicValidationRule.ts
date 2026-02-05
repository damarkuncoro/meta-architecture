import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule } from '../interfaces';
import { ISandbox, SecurityViolation } from '../../../domain/services/security/interfaces';

/**
 * Custom Logic Validation Rule
 * Validates custom validation logic safety using sandbox
 */
export class CustomLogicValidationRule implements ValidationRule<ContractEntity> {
  name = 'custom-logic-validation';
  description = 'Validates custom validation logic safety using sandbox';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'security';
  severity: 'error' | 'warning' | 'info' = 'error';

  constructor(private readonly sandbox: ISandbox) {}

  async validate(contract: ContractEntity): Promise<ValidationError | null> {
    if (!contract.validation.customValidator) {
      return null;
    }

    // Validate code structure and security without executing
    const result = await this.sandbox.validateCode(contract.validation.customValidator);

    if (result.isFailure) {
      return new ValidationError(
        `Custom validator check failed: ${result.error.message}`,
        'CUSTOM_VALIDATION_CHECK_ERROR',
        { error: result.error }
      );
    }

    if (result.value.length > 0) {
      return new ValidationError(
        `Custom validator contains security violations: ${result.value.map((v: SecurityViolation) => v.description).join('; ')}`,
        'CUSTOM_VALIDATION_VIOLATION',
        { violations: result.value }
      );
    }

    return null;
  }
}
