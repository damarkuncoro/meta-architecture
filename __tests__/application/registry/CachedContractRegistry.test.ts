import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedContractRegistry } from '../../../src/application/registry/CachedContractRegistry';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { Result } from '../../../src/shared/result';

// Mocks
const mockRepository = {
  findById: vi.fn(),
  findByName: vi.fn(),
  findByCategory: vi.fn(),
  findAll: vi.fn(),
  findActive: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn()
};

const mockEventPublisher = {
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn()
};

const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
  stats: vi.fn(),
  size: vi.fn().mockResolvedValue(0),
  keys: vi.fn().mockResolvedValue([]),
  getStats: vi.fn(),
  getConfig: vi.fn(),
  prune: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  setConfig: vi.fn(),
  cleanup: vi.fn(),
  close: vi.fn()
};

describe('CachedContractRegistry', () => {
  let registry: CachedContractRegistry;
  let testContract: ContractEntity;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new CachedContractRegistry(mockRepository, mockEventPublisher, mockCache);

    testContract = ContractEntity.create({
      id: 'test-id',
      name: 'test-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'variant', type: 'custom', values: ['a'] })],
      props: [ContractProp.create({ name: 'prop', type: 'string' })]
    });
  });

  describe('getById', () => {
    it('should return cached contract if available', async () => {
      mockCache.get.mockResolvedValue(testContract);

      const result = await registry.getById('test-id');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(testContract);
      expect(mockCache.get).toHaveBeenCalledWith('contract:id:test-id');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(testContract);

      const result = await registry.getById('test-id');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(testContract);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockCache.set).toHaveBeenCalledWith('contract:id:test-id', testContract, expect.any(Number));
    });

    it('should not cache if repository returns null', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      const result = await registry.getById('missing-id');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('getByName', () => {
    it('should return cached contract if available', async () => {
      mockCache.get.mockResolvedValue(testContract);

      const result = await registry.getByName('test-contract');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(testContract);
      expect(mockCache.get).toHaveBeenCalledWith('contract:name:test-contract');
      expect(mockRepository.findByName).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepository.findByName.mockResolvedValue(testContract);

      const result = await registry.getByName('test-contract');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(testContract);
      expect(mockRepository.findByName).toHaveBeenCalledWith('test-contract');
      expect(mockCache.set).toHaveBeenCalledWith('contract:name:test-contract', testContract, expect.any(Number));
    });
  });

  describe('getByCategory', () => {
    it('should return cached contracts if available', async () => {
      const contracts = [testContract];
      mockCache.get.mockResolvedValue(contracts);

      const result = await registry.getByCategory('ui.component');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toStrictEqual(contracts);
      expect(mockCache.get).toHaveBeenCalledWith('contracts:category:ui.component');
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache on cache miss', async () => {
      const contracts = [testContract];
      mockCache.get.mockResolvedValue(null);
      mockRepository.findByCategory.mockResolvedValue(contracts);

      const result = await registry.getByCategory('ui.component');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toStrictEqual(contracts);
      expect(mockRepository.findByCategory).toHaveBeenCalledWith('ui.component');
      expect(mockCache.set).toHaveBeenCalledWith('contracts:category:ui.component', contracts, expect.any(Number));
    });
  });

  describe('getAll', () => {
    it('should return cached contracts if available', async () => {
      const contracts = [testContract];
      mockCache.get.mockResolvedValue(contracts);

      const result = await registry.getAll();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toStrictEqual(contracts);
      expect(mockCache.get).toHaveBeenCalledWith('contracts:all');
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache on cache miss', async () => {
      const contracts = [testContract];
      mockCache.get.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(contracts);

      const result = await registry.getAll();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toStrictEqual(contracts);
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith('contracts:all', contracts, expect.any(Number));
    });
  });
});
