import { ContractEntity } from '../entities/ContractEntity';

/**
 * Contract Repository Interface
 * Defines the contract for contract persistence operations
 */
export interface IContractRepository {
  /**
   * Saves a contract entity
   */
  save(contract: ContractEntity): Promise<void>;

  /**
   * Finds a contract by ID
   */
  findById(id: string): Promise<ContractEntity | null>;

  /**
   * Finds a contract by name
   */
  findByName(name: string): Promise<ContractEntity | null>;

  /**
   * Finds all contracts
   */
  findAll(): Promise<ContractEntity[]>;

  /**
   * Finds contracts by category
   */
  findByCategory(category: string): Promise<ContractEntity[]>;

  /**
   * Finds active contracts
   */
  findActive(): Promise<ContractEntity[]>;

  /**
   * Deletes a contract by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if a contract exists by name
   */
  exists(name: string): Promise<boolean>;
}
