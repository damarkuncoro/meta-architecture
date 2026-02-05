import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateTransactionUseCase } from '../../../src/application/use-cases/ValidateTransactionUseCase';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';;
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractValidation } from '../../../src/domain/entities/ContractValidation';
import { Result } from '../../../src/shared/result';
import { ContractLogicExecutor } from '../../../src/domain/services/validation/ContractLogicExecutor';

// Mock Sandbox
const mockExecute = vi.fn();
const mockSandbox = {
  execute: mockExecute
} as any;

describe('ValidateTransactionUseCase', () => {
  let useCase: ValidateTransactionUseCase;
  let repository: InMemoryContractRepository;
  let activeContract: ContractEntity;
  let logicExecutor: ContractLogicExecutor;

  beforeEach(() => {
    repository = new InMemoryContractRepository();
    logicExecutor = new ContractLogicExecutor(mockSandbox);
    useCase = new ValidateTransactionUseCase(repository, logicExecutor);

    activeContract = ContractEntity.create({
      name: 'active-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v1', type: 'size', values: ['s'] })],
      props: [
        ContractProp.create({ name: 'requiredProp', type: 'string', required: true }),
        ContractProp.create({ name: 'optionalProp', type: 'number', required: false })
      ],
      validation: ContractValidation.create([
        { type: 'custom', target: 'all', params: { script: 'some script' } }
      ])
    });

    // Make contract active
    activeContract.markAsValidated();
    activeContract.approve();
    activeContract.activate();

    repository.save(activeContract);
  });

  it('should validate valid payload', async () => {
    mockExecute.mockResolvedValue(Result.success({
      success: true,
      result: { isValid: true }
    }));

    const result = await useCase.execute({
      contractId: activeContract.id,
      payload: { requiredProp: 'value' }
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.isValid).toBe(true);
    expect(result.value.errors).toHaveLength(0);
  });

  it('should fail if contract not found', async () => {
    const result = await useCase.execute({
      contractId: 'missing',
      payload: {}
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Contract not found');
  });

  it('should fail if contract not active', async () => {
    const draftContract = ContractEntity.create({
      name: 'draft-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v1', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p1', type: 'string' })]
    });
    await repository.save(draftContract);

    const result = await useCase.execute({
      contractId: draftContract.id,
      payload: { p1: 'val' }
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('not active');
  });

  it('should fail on missing required prop', async () => {
    const result = await useCase.execute({
      contractId: activeContract.id,
      payload: {} // Missing requiredProp
    });

    expect(result.isSuccess).toBe(true); // Logic ran successfully
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors[0]).toContain('Missing required property');
  });

  it('should fail on type mismatch', async () => {
    const result = await useCase.execute({
      contractId: activeContract.id,
      payload: { requiredProp: 123 } // Should be string
    });

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors[0]).toContain('must be a string');
  });

  it('should fail on unknown property (Strict Mode)', async () => {
    const result = await useCase.execute({
      contractId: activeContract.id,
      payload: { 
        requiredProp: 'val',
        unknownProp: 'hacker' 
      }
    });

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors[0]).toContain("Unknown property 'unknownProp'");
  });

  it('should run custom validator', async () => {
    mockExecute.mockResolvedValue(Result.success({
      success: true,
      result: { 
        isValid: false, 
        errors: ['Custom logic failed'] 
      }
    }));

    const result = await useCase.execute({
      contractId: activeContract.id,
      payload: { requiredProp: 'value' }
    });

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain('Custom logic failed');
  });
});
