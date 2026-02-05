import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { ContractLogicExecutor } from '../../domain/services/validation/ContractLogicExecutor';
import { Result } from '../../shared/result';
import { ValidateTransactionRequest, ValidateTransactionResponse } from './dtos';
import { TransactionPluginRegistry } from '../validation/TransactionPluginRegistry';

/**
 * Use Case: Validate Transaction
 * Canonical example of using a Contract to validate runtime data.
 * Demonstrates:
 * 1. Contract Lifecycle Enforcement (Active status)
 * 2. Structural Validation (Props)
 * 3. Secure Dynamic Logic Execution (Sandboxing)
 * 4. External Plugin Validation (Extensibility)
 */
export class ValidateTransactionUseCase {
  constructor(
    private readonly contractRepository: IContractRepository,
    private readonly logicExecutor: ContractLogicExecutor,
    private readonly pluginRegistry?: TransactionPluginRegistry
  ) {}

  async execute(request: ValidateTransactionRequest): Promise<Result<ValidateTransactionResponse, Error>> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let executionTime = 0;

    try {
      // 1. Load Contract
      const contract = await this.contractRepository.findById(request.contractId);
      if (!contract) {
        return Result.failure(new Error(`Contract not found: ${request.contractId}`));
      }

      // 2. Lifecycle Check: Contract must be ACTIVE
      if (!contract.status.isActive) {
        return Result.failure(new Error(`Contract is not active. Current status: ${contract.status.value}`));
      }

      // 3. Structural Validation (Props)
      
      // 3a. Excess Property Check (Strict Mode)
      // Ensure payload doesn't contain unknown properties (hallucinations)
      const allowedProps = new Set(contract.props.map(p => p.name));
      const payloadKeys = Object.keys(request.payload);
      
      for (const key of payloadKeys) {
        if (!allowedProps.has(key)) {
          errors.push(`Unknown property '${key}' is not defined in the contract`);
        }
      }

      // 3b. Requirement & Type Check
      for (const prop of contract.props) {
        const value = request.payload[prop.name];

        // Requirement check
        if (prop.required && (value === undefined || value === null)) {
          errors.push(`Missing required property: ${prop.name}`);
          continue;
        }

        if (value !== undefined && value !== null) {
          // Delegate validation to the Domain Entity
          const propErrors = prop.validateValue(value);
          errors.push(...propErrors);
        }
      }

      // 4. Custom Logic Validation (Sandbox)
      const logicResult = await this.logicExecutor.executeValidator(
        contract,
        request.payload,
        request.context
      );

      if (logicResult.isFailure) {
        errors.push(`Custom validator execution failed: ${logicResult.error.message}`);
      } else {
        const result = logicResult.value;
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        executionTime = result.executionTime;
      }

      // 5. External Plugin Validation
      if (this.pluginRegistry) {
        const pluginErrors = await this.pluginRegistry.executeAll({
          contract,
          payload: request.payload,
          userContext: request.context,
          timestamp: startTime
        });
        errors.push(...pluginErrors);
      }

      const response: ValidateTransactionResponse = {
        isValid: errors.length === 0,
        errors,
        warnings,
        processingTime: Date.now() - startTime,
        contractId: contract.id,
        contractVersion: contract.contractVersion
      };

      return Result.success(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(new Error(`Transaction validation failed: ${errorMessage}`));
    }
  }
}
