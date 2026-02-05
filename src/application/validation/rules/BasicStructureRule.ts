import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule } from '../interfaces';

/**
 * Basic Structure Validation Rule
 * Validates basic contract structure (name, category, props, variants)
 */
export class BasicStructureRule implements ValidationRule<ContractEntity> {
  name = 'basic-structure-validation';
  description = 'Validates basic contract structure';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'schema';
  severity: 'error' | 'warning' | 'info' = 'error';

  async validate(contract: ContractEntity): Promise<ValidationError | null> {
    // Basic validation - contract should have required properties
    if (!contract.name || !contract.category) {
      return new ValidationError(
        'Contract missing required name or category',
        'MISSING_REQUIRED_PROPERTIES'
      );
    }

    if (contract.props.length === 0) {
      return new ValidationError(
        'Contract must have at least one property',
        'EMPTY_PROPS'
      );
    }

    if (contract.variants.length === 0) {
      return new ValidationError(
        'Contract must have at least one variant',
        'EMPTY_VARIANTS'
      );
    }

    return null;
  }
}
