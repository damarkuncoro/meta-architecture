import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { ValidationRule } from '../interfaces';

/**
 * Performance Limits Rule
 * Validates contract size and complexity limits
 */
export class PerformanceLimitsRule implements ValidationRule<ContractEntity> {
  name = 'performance-limits';
  description = 'Validates contract size and complexity limits';
  category: 'schema' | 'business' | 'performance' | 'security' | 'compatibility' = 'performance';
  severity: 'error' | 'warning' | 'info' = 'warning';

  async validate(contract: ContractEntity): Promise<ValidationError | null> {
    const propCount = contract.props.length;
    const variantCount = contract.variants.length;

    if (propCount > 50) {
      return new ValidationError(
        `Contract has ${propCount} props, which may impact performance`,
        'HIGH_PROP_COUNT',
        { propCount, recommendedMax: 50 }
      );
    }

    if (variantCount > 20) {
      return new ValidationError(
        `Contract has ${variantCount} variants, consider reducing complexity`,
        'HIGH_VARIANT_COUNT',
        { variantCount, recommendedMax: 20 }
      );
    }

    return null;
  }
}
