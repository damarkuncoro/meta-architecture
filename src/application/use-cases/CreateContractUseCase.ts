import { ContractEntity } from '../../domain/entities/ContractEntity';
import { ContractVariant } from '../../domain/entities/ContractVariant';
import { ContractProp } from '../../domain/entities/ContractProp';
import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { Result } from '../../shared/result';
import { CreateContractRequest, CreateContractResponse } from './dtos';
import { ValidationPipeline } from '../validation/ValidationPipeline';

/**
 * Use Case: Create Contract
 * Orchestrates the creation of a new contract entity
 */
export class CreateContractUseCase {
  constructor(
    private readonly contractRepository: IContractRepository,
    private readonly validationPipeline: ValidationPipeline
  ) {}

  /**
   * Executes the create contract use case
   */
  async execute(request: CreateContractRequest): Promise<Result<CreateContractResponse, Error>> {
    try {
      // Check if contract with same name already exists
      const existingContract = await this.contractRepository.findByName(request.name);
      if (existingContract) {
        return Result.failure(new Error(`Contract with name '${request.name}' already exists`));
      }

      // Create the contract entity
      const contract = ContractEntity.create({
        name: request.name,
        category: request.category,
        variants: request.variants?.map(v =>
          ContractVariant.create({
            name: v.name,
            type: v.type,
            values: v.values,
            defaultValue: v.defaultValue,
            description: v.description
          })
        ),
        props: request.props?.map(p =>
          ContractProp.create({
            name: p.name,
            type: p.type,
            required: p.required || false,
            defaultValue: p.defaultValue,
            description: p.description,
            validation: p.validation
          })
        ),
        accessibility: request.accessibility,
        validation: request.validation,
        metadata: {
          ...request.metadata,
          description: request.description
        }
      });

      // Fetch all contracts for validation context (e.g. similarity checks)
      const allContracts = await this.contractRepository.findAll();
      const activeContracts = allContracts.filter(c => c.status.isActive);

      // Validate contract using pipeline
      const validationResult = await this.validationPipeline.validateContract(contract, {
        environment: (process.env.NODE_ENV as any) || 'development',
        existingContracts: allContracts,
        userPermissions: request.context?.permissions || [],
        registryStats: {
          totalContracts: allContracts.length,
          activeContracts: activeContracts.length
        }
      });

      if (validationResult.isFailure) {
        return Result.failure(validationResult.error);
      }

      if (!validationResult.value.isValid) {
        const errors = validationResult.value.errors.map(e => e.message).join('; ');
        return Result.failure(new Error(`Contract validation failed: ${errors}`));
      }

      // Save to repository
      await this.contractRepository.save(contract);

      const response: CreateContractResponse = {
        contract,
        success: true,
        message: `Contract '${request.name}' created successfully`
      };

      return Result.success(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(new Error(`Failed to create contract: ${errorMessage}`));
    }
  }
}