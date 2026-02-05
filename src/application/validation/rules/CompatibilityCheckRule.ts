import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule, ValidationContext } from '../interfaces';
import { StringUtils } from '../../../shared/utils/StringUtils';

/**
 * Compatibility Check Rule
 * Validates contract compatibility with existing ecosystem
 */
export class CompatibilityCheckRule implements ValidationRule<ContractEntity> {
  name = 'compatibility-check';
  description = 'Validates contract compatibility with existing ecosystem';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'compatibility';
  severity: 'error' | 'warning' | 'info' = 'warning';

  async validate(contract: ContractEntity, context: ValidationContext): Promise<ValidationError | null> {
    // Check for naming conflicts with existing contracts
    const similarNames = context.existingContracts
      .filter(c => StringUtils.calculateSimilarity(c.name.value, contract.name.value) > 0.8)
      .map(c => c.name.value);

    if (similarNames.length > 0) {
      return new ValidationError(
        `Contract name is very similar to existing contracts: ${similarNames.join(', ')}`,
        'SIMILAR_CONTRACT_NAMES',
        { similarNames }
      );
    }

    return null;
  }
}
