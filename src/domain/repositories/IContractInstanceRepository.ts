import { ContractInstanceEntity } from '../entities/ContractInstanceEntity';

/**
 * Contract Instance Repository Interface
 * Defines the contract for contract instance persistence operations
 */
export interface IContractInstanceRepository {
  /**
   * Saves a contract instance entity
   */
  save(instance: ContractInstanceEntity): Promise<void>;

  /**
   * Finds a contract instance by ID
   */
  findById(id: string): Promise<ContractInstanceEntity | null>;

  /**
   * Finds all instances for a specific contract definition
   */
  findByContractId(contractId: string): Promise<ContractInstanceEntity[]>;

  /**
   * Deletes a contract instance by ID
   */
  delete(id: string): Promise<void>;
}
