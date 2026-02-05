import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedContractRepository } from '../../../src/infrastructure/repositories/CachedContractRepository';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';

describe('CachedContractRepository', () => {
  let cachedRepo: CachedContractRepository;
  let mockRepo: any;
  let mockCache: any;
  let testContract: ContractEntity;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      findByCategory: vi.fn(),
      findActive: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    };

    cachedRepo = new CachedContractRepository(mockRepo, mockCache);

    testContract = ContractEntity.create({
      id: 'contract-123',
      name: 'test-contract',
      category: ContractCategory.SERVICE,
      variants: [{
        name: 'default',
        description: 'Default variant',
        values: { size: 'medium' }
      } as any],
      props: [{
          name: 'size',
          type: 'string',
          required: true
      } as any]
    });
  });

  describe('findById', () => {
    it('should return cached value if present', async () => {
      mockCache.get.mockResolvedValue(testContract);

      const result = await cachedRepo.findById('contract-123');

      expect(result).toBe(testContract);
      expect(mockCache.get).toHaveBeenCalledWith('contract:id:contract-123');
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache on miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findById.mockResolvedValue(testContract);

      const result = await cachedRepo.findById('contract-123');

      expect(result).toBe(testContract);
      expect(mockRepo.findById).toHaveBeenCalledWith('contract-123');
      expect(mockCache.set).toHaveBeenCalledWith('contract:id:contract-123', testContract, 300000);
      // It also caches by name opportunistically
      expect(mockCache.set).toHaveBeenCalledWith('contract:name:test-contract', testContract, 300000);
    });

    it('should return null if not found in repository', async () => {
        mockCache.get.mockResolvedValue(null);
        mockRepo.findById.mockResolvedValue(null);
  
        const result = await cachedRepo.findById('non-existent');
  
        expect(result).toBeNull();
        expect(mockCache.set).not.toHaveBeenCalled();
      });
  });

  describe('save', () => {
    it('should save to repository and invalidate cache', async () => {
      await cachedRepo.save(testContract);

      expect(mockRepo.save).toHaveBeenCalledWith(testContract);
      expect(mockCache.delete).toHaveBeenCalledWith('contract:id:contract-123');
      expect(mockCache.delete).toHaveBeenCalledWith('contract:name:test-contract');
    });
  });

  describe('delete', () => {
      it('should delete from repository and invalidate cache', async () => {
        // Setup findById to return contract so we can get the name for invalidation
        mockRepo.findById.mockResolvedValue(testContract);
        mockCache.get.mockResolvedValue(null); // Force repo fetch

        await cachedRepo.delete('contract-123');
  
        expect(mockRepo.delete).toHaveBeenCalledWith('contract-123');
        expect(mockCache.delete).toHaveBeenCalledWith('contract:id:contract-123');
        expect(mockCache.delete).toHaveBeenCalledWith('contract:name:test-contract');
      });
    });
});
