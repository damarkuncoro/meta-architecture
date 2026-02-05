import { ContractEntity } from '../../domain/entities/ContractEntity';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';
import { RegistryStats } from './RegistryStats';

/**
 * Interface for Contract Registry
 * Defines operations for contract management, discovery, and monitoring
 */
export interface IContractRegistry {
  /**
   * Register a contract in the registry
   */
  register(contract: ContractEntity): Promise<Result<void, ValidationError>>;

  /**
   * Unregister a contract from the registry
   */
  unregister(contractId: string): Promise<Result<boolean, ValidationError>>;

  /**
   * Get contract by ID
   */
  getById(contractId: string): Promise<Result<ContractEntity | null, ValidationError>>;

  /**
   * Get contract by name
   */
  getByName(name: string): Promise<Result<ContractEntity | null, ValidationError>>;

  /**
   * Get all contracts in a category
   */
  getByCategory(category: string): Promise<Result<ContractEntity[], ValidationError>>;

  /**
   * Get all registered contracts
   */
  getAll(): Promise<Result<ContractEntity[], ValidationError>>;

  /**
   * Get active contracts only
   */
  getActive(): Promise<Result<ContractEntity[], ValidationError>>;

  /**
   * Check if contract exists
   */
  exists(contractId: string): Promise<Result<boolean, ValidationError>>;

  /**
   * Refresh registry from repository
   */
  refresh(): Promise<Result<void, ValidationError>>;

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats;

  /**
   * Clear local registry (for testing)
   */
  clear(): void;
}
