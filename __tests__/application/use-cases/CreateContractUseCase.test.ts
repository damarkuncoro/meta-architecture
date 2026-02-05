import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateContractUseCase } from '../../../src/application/use-cases/CreateContractUseCase';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { ValidationPipeline } from '../../../src/application/validation/ValidationPipeline';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';;
import { Result } from '../../../src/shared/result';

// Mock ValidationPipeline
const mockValidateContract = vi.fn();
const mockValidationPipeline = {
  validateContract: mockValidateContract
} as unknown as ValidationPipeline;

describe('CreateContractUseCase', () => {
  let useCase: CreateContractUseCase;
  let repository: InMemoryContractRepository;

  beforeEach(() => {
    repository = new InMemoryContractRepository();
    useCase = new CreateContractUseCase(repository, mockValidationPipeline);
    
    // Default mock behavior: success
    mockValidateContract.mockResolvedValue(Result.success({
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: Date.now(),
      duration: 0
    }));
  });

  it('should create a valid contract', async () => {
    const request = {
      name: 'button',
      category: ContractCategory.UI_COMPONENT,
      variants: [{ name: 'size', type: 'size' as const, values: ['sm'] }],
      props: [{ name: 'label', type: 'string' }]
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.value.success).toBe(true);
    expect(result.value.contract.name.value).toBe('button');
    
    // Verify it was saved
    const saved = await repository.findByName('button');
    expect(saved).toBeDefined();
  });

  it('should fail if contract name exists', async () => {
    const request = {
      name: 'button',
      category: ContractCategory.UI_COMPONENT,
      variants: [{ name: 'size', type: 'size' as const, values: ['sm'] }],
      props: [{ name: 'label', type: 'string' }]
    };

    await useCase.execute(request);
    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('already exists');
  });

  it('should fail if validation pipeline fails', async () => {
    mockValidateContract.mockResolvedValue(Result.success({
      isValid: false,
      errors: [{ code: 'ERROR', message: 'Validation failed' }],
      warnings: [],
      timestamp: Date.now(),
      duration: 0
    }));

    const request = {
      name: 'invalid-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [{ name: 'size', type: 'size' as const, values: ['sm'] }],
      props: [{ name: 'label', type: 'string' }]
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Contract validation failed');
  });

  it('should handle errors gracefully', async () => {
    vi.spyOn(repository, 'save').mockRejectedValue(new Error('DB Error'));

    const request = {
      name: 'error-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [{ name: 'size', type: 'size' as const, values: ['sm'] }],
      props: [{ name: 'label', type: 'string' }]
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Failed to create contract');
  });

  it('should pass user context to validation pipeline', async () => {
    const request = {
      name: 'context-test',
      category: ContractCategory.UI_COMPONENT,
      variants: [{ name: 'size', type: 'size' as const, values: ['sm'] }],
      props: [{ name: 'label', type: 'string' }],
      context: {
        permissions: ['admin']
      }
    };

    await useCase.execute(request);

    expect(mockValidateContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userPermissions: ['admin']
      })
    );
  });
});
