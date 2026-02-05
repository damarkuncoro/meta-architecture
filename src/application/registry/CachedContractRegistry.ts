import { ContractEntity } from '../../domain/entities/ContractEntity';
import { ContractRegistry } from './ContractRegistry';
import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { IDomainEventPublisher } from '../../domain/shared/events';
import { ICache } from '../../domain/services/caching/interfaces';
import { CacheKeyGenerator } from '../../domain/services/caching/CacheKeyGenerator';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';
import { IContractRegistry } from './IContractRegistry';
import { RegistryStats } from './RegistryStats';

/**
 * Cached Contract Registry - Decorates ContractRegistry with caching capabilities
 * Implements cache-aside pattern for optimal performance
 */
export class CachedContractRegistry extends ContractRegistry implements IContractRegistry {
  constructor(
    repository: IContractRepository,
    eventPublisher: IDomainEventPublisher | undefined,
    private readonly cache: ICache,
    private readonly cacheTtl: number = 5 * 60 * 1000 // 5 minutes default
  ) {
    super(repository, eventPublisher);
  }

  /**
   * Check if contract exists with caching
   */
  async exists(contractId: string): Promise<Result<boolean, ValidationError>> {
    const cacheKey = CacheKeyGenerator.contractExists(contractId);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached as boolean);
    }

    // Cache miss - get from registry
    const result = await super.exists(contractId);

    // Cache the result if successful
    if (result.isSuccess) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    return super.getStats();
  }

  /**
   * Clear local registry and cache (for testing)
   */
  clear(): void {
    super.clear();
    // Fire and forget for cache clearing since method is synchronous
    this.cache.clear().catch(err => {
      console.error('Failed to clear cache in clear():', err);
    });
  }

  /**
   * Get contract by ID with caching
   */
  async getById(contractId: string): Promise<Result<ContractEntity | null, ValidationError>> {
    const cacheKey = CacheKeyGenerator.contractById(contractId);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached);
    }

    // Cache miss - get from registry
    const result = await super.getById(contractId);

    // Cache the result if successful
    if (result.isSuccess && result.value !== null) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Get contract by name with caching
   */
  async getByName(name: string): Promise<Result<ContractEntity | null, ValidationError>> {
    const cacheKey = CacheKeyGenerator.contractByName(name);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached);
    }

    // Cache miss - get from registry
    const result = await super.getByName(name);

    // Cache the result if successful
    if (result.isSuccess && result.value !== null) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Get contracts by category with caching
   */
  async getByCategory(category: string): Promise<Result<ContractEntity[], ValidationError>> {
    const cacheKey = CacheKeyGenerator.contractsByCategory(category);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached);
    }

    // Cache miss - get from registry
    const result = await super.getByCategory(category);

    // Cache the result if successful
    if (result.isSuccess) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Get all contracts with caching
   */
  async getAll(): Promise<Result<ContractEntity[], ValidationError>> {
    const cacheKey = CacheKeyGenerator.allContracts();

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached);
    }

    // Cache miss - get from registry
    const result = await super.getAll();

    // Cache the result if successful
    if (result.isSuccess) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Get active contracts with caching
   */
  async getActive(): Promise<Result<ContractEntity[], ValidationError>> {
    const cacheKey = CacheKeyGenerator.activeContracts();

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return Result.success(cached);
    }

    // Cache miss - get from registry
    const result = await super.getActive();

    // Cache the result if successful
    if (result.isSuccess) {
      await this.cache.set(cacheKey, result.value, this.cacheTtl);
    }

    return result;
  }

  /**
   * Register contract and invalidate related caches
   */
  async register(contract: ContractEntity): Promise<Result<void, ValidationError>> {
    const result = await super.register(contract);

    if (result.isSuccess) {
      // Invalidate related caches
      await this.invalidateContractCaches(contract);
    }

    return result;
  }

  /**
   * Unregister contract and invalidate related caches
   */
  async unregister(contractId: string): Promise<Result<boolean, ValidationError>> {
    // Get contract info before unregistering for cache invalidation
    const contractResult = await this.getById(contractId);
    const result = await super.unregister(contractId);

    if (result.isSuccess && result.value && contractResult.isSuccess && contractResult.value) {
      // Invalidate related caches
      await this.invalidateContractCaches(contractResult.value);
    }

    return result;
  }

  /**
   * Refresh registry and clear all caches
   */
  async refresh(): Promise<Result<void, ValidationError>> {
    const result = await super.refresh();

    if (result.isSuccess) {
      // Clear all caches on refresh
      await this.cache.clear();
    }

    return result;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cache.getStats();
  }

  /**
   * Manually invalidate specific cache entries
   */
  async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));

    for (const key of keysToDelete) {
      await this.cache.delete(key);
    }
  }

  /**
   * Warm up cache with frequently accessed contracts
   */
  async warmupCache(): Promise<void> {
    // Get active contracts and cache them
    const activeResult = await super.getActive();
    if (activeResult.isSuccess) {
      const cacheKey = CacheKeyGenerator.activeContracts();
      await this.cache.set(cacheKey, activeResult.value, this.cacheTtl);
    }

    // Cache individual active contracts
    if (activeResult.isSuccess) {
      for (const contract of activeResult.value.slice(0, 10)) { // Top 10 active contracts
        const cacheKey = CacheKeyGenerator.contractById(contract.id);
        await this.cache.set(cacheKey, contract, this.cacheTtl);
      }
    }
  }

  // Private methods

  private async invalidateContractCaches(contract: ContractEntity): Promise<void> {
    const keysToInvalidate = [
      CacheKeyGenerator.contractById(contract.id),
      CacheKeyGenerator.contractExists(contract.id),
      CacheKeyGenerator.contractByName(contract.name.value),
      CacheKeyGenerator.contractsByCategory(contract.category.value),
      CacheKeyGenerator.allContracts(),
      CacheKeyGenerator.activeContracts()
    ];

    for (const key of keysToInvalidate) {
      await this.cache.delete(key);
    }
  }
}
