import { ContractEntity } from '../../domain/entities/ContractEntity';
import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { ValidationError } from '../../domain/errors/ValidationError';

/**
 * In-Memory implementation of IContractRepository
 * Suitable for testing, development, and small-scale applications
 */
export class InMemoryContractRepository implements IContractRepository {
  private contracts = new Map<string, ContractEntity>();
  private readonly maxContracts: number;

  constructor(maxContracts = 1000) {
    this.maxContracts = maxContracts;
  }

  /**
   * Save a contract entity
   */
  async save(contract: ContractEntity): Promise<void> {
    if (this.contracts.size >= this.maxContracts) {
      throw new ValidationError(
        `Maximum contract limit (${this.maxContracts}) reached`,
        'REPOSITORY_LIMIT_EXCEEDED'
      );
    }

    // Store a copy to prevent external mutations
    this.contracts.set(contract.id, contract);
  }

  /**
   * Find contract by ID
   */
  async findById(id: string): Promise<ContractEntity | null> {
    return this.contracts.get(id) || null;
  }

  /**
   * Find contract by name
   */
  async findByName(name: string): Promise<ContractEntity | null> {
    for (const contract of this.contracts.values()) {
      if (contract.name.value === name) {
        return contract;
      }
    }
    return null;
  }

  /**
   * Find all contracts
   */
  async findAll(): Promise<ContractEntity[]> {
    return Array.from(this.contracts.values());
  }

  /**
   * Find active contracts
   */
  async findActive(): Promise<ContractEntity[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.status.isActive);
  }

  /**
   * Find contracts by category
   */
  async findByCategory(category: string): Promise<ContractEntity[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.category.value === category);
  }

  /**
   * Delete contract by ID
   */
  async delete(id: string): Promise<void> {
    this.contracts.delete(id);
  }

  /**
   * Check if contract exists by name
   */
  async exists(name: string): Promise<boolean> {
    for (const contract of this.contracts.values()) {
      if (contract.name.value === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clear all contracts (for testing)
   */
  clear(): void {
    this.contracts.clear();
  }

  /**
   * Get repository statistics
   */
  getStats(): {
    totalContracts: number;
    activeContracts: number;
    categories: Record<string, number>;
    memoryUsage: number;
  } {
    const contracts = Array.from(this.contracts.values());
    const activeContracts = contracts.filter(c => c.status.isActive).length;

    const categories: Record<string, number> = {};
    contracts.forEach(contract => {
      const categoryKey = contract.category.value;
      categories[categoryKey] = (categories[categoryKey] || 0) + 1;
    });

    // Rough memory estimation
    const memoryUsage = contracts.length * 1024; // ~1KB per contract estimate

    return {
      totalContracts: contracts.length,
      activeContracts,
      categories,
      memoryUsage
    };
  }
}