import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { ContractEntity } from '../../domain/entities/ContractEntity';
import { ICache } from '../../domain/services/caching/interfaces/ICache';
import { CacheKeyGenerator } from '../../domain/services/caching/CacheKeyGenerator';

/**
 * Cached Contract Repository
 * Decorator pattern to add caching to any IContractRepository implementation.
 * Follows SOLID (Open/Closed) and Clean Architecture (Infrastructure layer).
 * 
 * Uses ICache interface to allow swapping cache implementations (LRU, Redis, etc.)
 * without changing the repository logic.
 */
export class CachedContractRepository implements IContractRepository {
  constructor(
    private readonly repository: IContractRepository,
    private readonly cache: ICache<ContractEntity>,
    private readonly ttl: number = 300000 // 5 minutes default
  ) {}

  async save(contract: ContractEntity): Promise<void> {
    await this.repository.save(contract);
    // Invalidate cache to ensure subsequent reads get fresh data
    await this.invalidateContract(contract);
  }

  async findById(id: string): Promise<ContractEntity | null> {
    const key = CacheKeyGenerator.contractById(id);
    const cached = await this.cache.get(key);
    
    if (cached) {
        // If cache returns a raw object (e.g. from Redis), we might need hydration here.
        // For in-memory LruCache, it likely returns the instance.
        // We return it as is for now, assuming the Cache implementation handles serialization/deserialization 
        // if needed, or stores references.
        return cached;
    }

    const contract = await this.repository.findById(id);
    if (contract) {
      await this.cache.set(key, contract, this.ttl);
      // We can also opportunistically cache by name
      const nameKey = CacheKeyGenerator.contractByName(contract.name.value);
      await this.cache.set(nameKey, contract, this.ttl);
    }
    return contract;
  }

  async findByName(name: string): Promise<ContractEntity | null> {
    const key = CacheKeyGenerator.contractByName(name);
    const cached = await this.cache.get(key);
    
    if (cached) {
      return cached;
    }

    const contract = await this.repository.findByName(name);
    if (contract) {
      await this.cache.set(key, contract, this.ttl);
      // Opportunistically cache by ID
      const idKey = CacheKeyGenerator.contractById(contract.id);
      await this.cache.set(idKey, contract, this.ttl);
    }
    return contract;
  }

  // Pass-through for list methods (complex to cache efficiently without sophisticated invalidation)
  // We delegate directly to the underlying repository.

  async findAll(): Promise<ContractEntity[]> {
    return this.repository.findAll();
  }

  async findByCategory(category: string): Promise<ContractEntity[]> {
    return this.repository.findByCategory(category);
  }

  async findActive(): Promise<ContractEntity[]> {
    return this.repository.findActive();
  }

  async delete(id: string): Promise<void> {
    // We need the contract to know its name for invalidation, 
    // but if we don't have it, we at least invalidate by ID.
    const contract = await this.findById(id);
    
    await this.repository.delete(id);
    
    if (contract) {
      await this.invalidateContract(contract);
    } else {
        // Fallback: just invalidate ID if we couldn't find it (already deleted or race condition)
        const key = CacheKeyGenerator.contractById(id);
        await this.cache.delete(key);
    }
  }

  async exists(name: string): Promise<boolean> {
    const key = CacheKeyGenerator.contractByName(name);
    if (await this.cache.has(key)) {
      return true;
    }
    return this.repository.exists(name);
  }

  private async invalidateContract(contract: ContractEntity): Promise<void> {
    const idKey = CacheKeyGenerator.contractById(contract.id);
    const nameKey = CacheKeyGenerator.contractByName(contract.name.value);
    
    await Promise.all([
      this.cache.delete(idKey),
      this.cache.delete(nameKey)
    ]);
  }
}
