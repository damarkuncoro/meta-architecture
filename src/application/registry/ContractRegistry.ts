import { ContractEntity } from '../../domain/entities/ContractEntity';
import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { IDomainEventPublisher } from '../../domain/shared/events';
import { ContractRegistryEvent, ContractRegisteredEvent, ContractUnregisteredEvent, ContractLookupEvent } from '../../domain/events/registry';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';
import { IContractRegistry } from './IContractRegistry';
import { RegistryStats } from './RegistryStats';

/**
 * Contract Registry - Centralized contract management system
 * Provides registration, discovery, and lifecycle management for contracts
 */
export class ContractRegistry implements IContractRegistry {
  private static instance: ContractRegistry;
  private registeredContracts = new Map<string, ContractEntity>();
  private contractCategories = new Map<string, Set<string>>();
  private readonly eventPublisher?: IDomainEventPublisher;

  constructor(
    private readonly repository: IContractRepository,
    eventPublisher?: IDomainEventPublisher
  ) {
    this.eventPublisher = eventPublisher;
  }

  /**
   * Get singleton instance (for global registry)
   */
  static getInstance(repository?: IContractRepository, eventPublisher?: IDomainEventPublisher): ContractRegistry {
    if (!ContractRegistry.instance) {
      if (!repository) {
        throw new ValidationError(
          'Repository is required for first ContractRegistry instantiation',
          'REGISTRY_INITIALIZATION_ERROR'
        );
      }
      ContractRegistry.instance = new ContractRegistry(repository, eventPublisher);
    }
    return ContractRegistry.instance;
  }

  /**
   * Register a contract in the registry
   */
  async register(contract: ContractEntity): Promise<Result<void, ValidationError>> {
    try {
      // Validate contract before registration
      const validation = this.validateContractForRegistration(contract);
      if (validation.isFailure) {
        return Result.failure(validation.error);
      }

      // Check for duplicate registration
      if (this.registeredContracts.has(contract.id)) {
        return Result.failure(new ValidationError(
          `Contract '${contract.name.value}' is already registered`,
          'CONTRACT_ALREADY_REGISTERED',
          { contractId: contract.id, contractName: contract.name.value }
        ));
      }

      // Persist to repository
      await this.repository.save(contract);

      // Register locally
      this.registeredContracts.set(contract.id, contract);
      this.addToCategoryIndex(contract);

      // Publish event
      await this.publishEvent(new ContractRegisteredEvent(
        contract.id,
        contract.name.value,
        contract.category.value
      ));

      return Result.success(undefined);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to register contract: ${error instanceof Error ? error.message : String(error)}`,
        'REGISTRATION_ERROR',
        { contractId: contract.id, originalError: error }
      ));
    }
  }

  /**
   * Unregister a contract from the registry
   */
  async unregister(contractId: string): Promise<Result<boolean, ValidationError>> {
    try {
      const contract = this.registeredContracts.get(contractId);
      if (!contract) {
        return Result.success(false); // Not found, but not an error
      }

      // Remove from repository
      await this.repository.delete(contractId);

      // Remove from local registry
      this.registeredContracts.delete(contractId);
      this.removeFromCategoryIndex(contract);

      // Publish event
      await this.publishEvent(new ContractUnregisteredEvent(
        contractId,
        contract.name.value,
        contract.category.value
      ));

      return Result.success(true);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to unregister contract: ${error instanceof Error ? error.message : String(error)}`,
        'UNREGISTRATION_ERROR',
        { contractId, originalError: error }
      ));
    }
  }

  /**
   * Get contract by ID
   */
  async getById(contractId: string): Promise<Result<ContractEntity | null, ValidationError>> {
    try {
      // Check local cache first
      let contract = this.registeredContracts.get(contractId);

      if (!contract) {
        // Load from repository
        const foundContract = await this.repository.findById(contractId);
        if (foundContract) {
          contract = foundContract;
          this.registeredContracts.set(contractId, contract);
          this.addToCategoryIndex(contract);
        }
      }

      // Publish lookup event
      await this.publishEvent(new ContractLookupEvent(
        contractId,
        contract ? 'found' : 'not_found',
        'id'
      ));

      return Result.success(contract || null);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to get contract by ID: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_LOOKUP_ERROR',
        { contractId, originalError: error }
      ));
    }
  }

  /**
   * Get contract by name
   */
  async getByName(name: string): Promise<Result<ContractEntity | null, ValidationError>> {
    try {
      // Check local registry first
      for (const contract of this.registeredContracts.values()) {
        if (contract.name.value === name) {
          await this.publishEvent(new ContractLookupEvent(
            contract.id,
            'found',
            'name'
          ));
          return Result.success(contract);
        }
      }

      // Load from repository
      const contract = await this.repository.findByName(name);
      if (contract) {
        this.registeredContracts.set(contract.id, contract);
        this.addToCategoryIndex(contract);
      }

      await this.publishEvent(new ContractLookupEvent(
        contract?.id || 'unknown',
        contract ? 'found' : 'not_found',
        'name'
      ));

      return Result.success(contract || null);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to get contract by name: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_LOOKUP_ERROR',
        { contractName: name, originalError: error }
      ));
    }
  }

  /**
   * Get all contracts in a category
   */
  async getByCategory(category: string): Promise<Result<ContractEntity[], ValidationError>> {
    try {
      // Get from local index
      const categoryContractIds = this.contractCategories.get(category) || new Set<string>();
      const localContracts = Array.from(categoryContractIds)
        .map(id => this.registeredContracts.get(id))
        .filter((contract): contract is ContractEntity => contract !== undefined);

      // Load missing contracts from repository
      const allCategoryContracts = await this.repository.findByCategory(category);
      const missingContracts = allCategoryContracts.filter(
        contract => !this.registeredContracts.has(contract.id)
      );

      // Register missing contracts locally
      for (const contract of missingContracts) {
        this.registeredContracts.set(contract.id, contract);
        this.addToCategoryIndex(contract);
        localContracts.push(contract);
      }

      return Result.success(localContracts);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to get contracts by category: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_LOOKUP_ERROR',
        { category, originalError: error }
      ));
    }
  }

  /**
   * Get all registered contracts
   */
  async getAll(): Promise<Result<ContractEntity[], ValidationError>> {
    try {
      // Get all from repository to ensure completeness
      const allContracts = await this.repository.findAll();

      // Update local registry
      for (const contract of allContracts) {
        this.registeredContracts.set(contract.id, contract);
        this.addToCategoryIndex(contract);
      }

      return Result.success(allContracts);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to get all contracts: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_LOOKUP_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Get active contracts only
   */
  async getActive(): Promise<Result<ContractEntity[], ValidationError>> {
    try {
      const activeContracts = await this.repository.findActive();

      // Update local registry with active contracts
      for (const contract of activeContracts) {
        this.registeredContracts.set(contract.id, contract);
        this.addToCategoryIndex(contract);
      }

      return Result.success(activeContracts);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to get active contracts: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_LOOKUP_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Check if contract exists
   */
  async exists(contractId: string): Promise<Result<boolean, ValidationError>> {
    try {
      // Check local first
      if (this.registeredContracts.has(contractId)) {
        return Result.success(true);
      }

      // Check repository
      const exists = await this.repository.exists(contractId);
      return Result.success(exists);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to check contract existence: ${error instanceof Error ? error.message : String(error)}`,
        'CONTRACT_EXISTS_ERROR',
        { contractId, originalError: error }
      ));
    }
  }

  /**
   * Refresh registry from repository
   */
  async refresh(): Promise<Result<void, ValidationError>> {
    try {
      const allContracts = await this.repository.findAll();

      // Clear local state
      this.registeredContracts.clear();
      this.contractCategories.clear();

      // Rebuild local state
      for (const contract of allContracts) {
        this.registeredContracts.set(contract.id, contract);
        this.addToCategoryIndex(contract);
      }

      return Result.success(undefined);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Failed to refresh registry: ${error instanceof Error ? error.message : String(error)}`,
        'REGISTRY_REFRESH_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const contracts = Array.from(this.registeredContracts.values());
    const activeContracts = contracts.filter(c => c.status.isActive).length;

    const categories: Record<string, number> = {};
    for (const [category, contractIds] of this.contractCategories.entries()) {
      categories[category] = contractIds.size;
    }

    // Rough memory estimation
    const memoryUsage = contracts.length * 2048; // ~2KB per contract with registry overhead

    return {
      totalContracts: contracts.length,
      categories,
      activeContracts,
      memoryUsage
    };
  }

  /**
   * Clear local registry (for testing)
   */
  clear(): void {
    this.registeredContracts.clear();
    this.contractCategories.clear();
  }

  // Private helper methods

  private validateContractForRegistration(contract: ContractEntity): Result<void, ValidationError> {
    // Basic validation - contract should be valid according to domain rules
    // Additional registry-specific validation can be added here

    if (!contract.id || contract.id.trim() === '') {
      return Result.failure(ValidationError.required('contract.id'));
    }

    if (!contract.name || !contract.name.value || contract.name.value.trim() === '') {
      return Result.failure(ValidationError.required('contract.name'));
    }

    return Result.success(undefined);
  }

  private addToCategoryIndex(contract: ContractEntity): void {
    const category = contract.category.value;
    if (!this.contractCategories.has(category)) {
      this.contractCategories.set(category, new Set<string>());
    }
    this.contractCategories.get(category)!.add(contract.id);
  }

  private removeFromCategoryIndex(contract: ContractEntity): void {
    const category = contract.category.value;
    const categorySet = this.contractCategories.get(category);
    if (categorySet) {
      categorySet.delete(contract.id);
      if (categorySet.size === 0) {
        this.contractCategories.delete(category);
      }
    }
  }

  private async publishEvent(event: ContractRegistryEvent): Promise<void> {
    if (this.eventPublisher) {
      await this.eventPublisher.publish(event);
    }
  }
}