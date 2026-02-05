import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ContractDefinitionValidator, SchemaValidationError } from '../../../schemas';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule } from '../interfaces';

/**
 * Spec Compliance Rule
 * Ensures contract adheres to the Formal Contract Specification v1.0
 */
export class SpecComplianceRule implements ValidationRule<ContractEntity> {
  name = 'spec-compliance';
  description = 'Ensures contract adheres to the Formal Contract Specification v1.0';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'schema';
  severity: 'error' | 'warning' | 'info' = 'error';

  async validate(contract: ContractEntity): Promise<ValidationError | null> {
    const definition = contract.toJSON();
    const result = ContractDefinitionValidator.validate(definition);

    if (!result.isValid) {
      const details = result.errors.map((e: SchemaValidationError) => `${e.path}: ${e.message}`).join('; ');
      return new ValidationError(
        `Contract violates Spec v1.0: ${details}`,
        'SPEC_VIOLATION',
        { errors: result.errors, warnings: result.warnings }
      );
    }
    return null;
  }
}
