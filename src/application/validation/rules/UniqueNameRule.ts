import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule, ValidationContext } from '../interfaces';

/**
 * Unique Name Rule
 * Ensures contract name is unique across registry
 */
export class UniqueNameRule implements ValidationRule<ContractEntity> {
  name = 'unique-name';
  description = 'Ensures contract name is unique across registry';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'business';
  severity: 'error' | 'warning' | 'info' = 'error';

  async validate(contract: ContractEntity, context: ValidationContext): Promise<ValidationError | null> {
    const existing = context.existingContracts.find(c => c.name.value === contract.name.value);
    return existing ? new ValidationError(
      `Contract name '${contract.name.value}' already exists`,
      'DUPLICATE_CONTRACT_NAME',
      { existingContractId: existing.id }
    ) : null;
  }
}
