import { ISandbox, ExecutionOptions } from '../security/interfaces';
import { Result } from '../../../shared/result';
import { ValidationError } from '../../errors/ValidationError';
import { ContractEntity } from '../../entities/ContractEntity';

/**
 * Result of contract logic execution
 */
export interface ContractLogicResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  executionTime: number;
}

/**
 * Service to execute custom contract logic safely
 */
export class ContractLogicExecutor {
  constructor(private readonly sandbox: ISandbox) {}

  /**
   * Executes the custom validator of a contract
   */
  async executeValidator(
    contract: ContractEntity,
    payload: any,
    context: any = {}
  ): Promise<Result<ContractLogicResult, ValidationError>> {
    if (!contract.validation.customValidator) {
      return Result.success({
        isValid: true,
        errors: [],
        warnings: [],
        executionTime: 0
      });
    }

    const options: ExecutionOptions = {
      context: {
        payload,
        context,
        contractMetadata: contract.metadata
      }
    };

    const sandboxResult = await this.sandbox.execute(
      contract.validation.customValidator,
      undefined,
      options
    );

    if (sandboxResult.isFailure) {
      return Result.failure(sandboxResult.error);
    }

    const executionResult = sandboxResult.value;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!executionResult.success) {
       return Result.failure(new ValidationError(`Custom validator error: ${executionResult.error}`));
    }

    const result = executionResult.result as any;

    // Parse result from script
    if (result && typeof result === 'object') {
      if (result.isValid === false) {
        if (Array.isArray(result.errors)) {
          errors.push(...result.errors);
        } else {
          errors.push('Custom validation failed');
        }
      }
      if (result.warnings && Array.isArray(result.warnings)) {
        warnings.push(...result.warnings);
      }
    }

    return Result.success({
      isValid: errors.length === 0,
      errors,
      warnings,
      executionTime: executionResult.executionTime
    });
  }
}
