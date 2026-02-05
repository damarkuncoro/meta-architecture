import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateTransactionUseCase } from '../../../src/application/use-cases/ValidateTransactionUseCase';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractStatus } from '../../../src/domain/value-objects/ContractStatus';
import { Result } from '../../../src/shared/result';
import { ContractLogicExecutor } from '../../../src/domain/services/validation/ContractLogicExecutor';

describe('ValidateTransactionUseCase - Complex Validation', () => {
  let useCase: ValidateTransactionUseCase;
  let mockRepo: any;
  let mockSandbox: any;
  let logicExecutor: ContractLogicExecutor;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
    };
    mockSandbox = {
      execute: vi.fn(),
    };
    logicExecutor = new ContractLogicExecutor(mockSandbox);
    useCase = new ValidateTransactionUseCase(mockRepo, logicExecutor);
  });

  const createActiveContract = (props: ContractProp[]) => {
    const contract = ContractEntity.create({
      name: 'test-contract',
      category: ContractCategory.SERVICE,
      variants: [{ name: 'default', type: 'basic', values: ['default'] } as any],
      props: props,
    });
    // Force active status for testing
    (contract as any)._status = ContractStatus.ACTIVE;
    return contract;
  };

  it('should validate number ranges (min/max)', async () => {
    const props = [
      ContractProp.create({
        name: 'age',
        type: 'number',
        validation: { min: 18, max: 65 }
      })
    ];
    mockRepo.findById.mockResolvedValue(createActiveContract(props));

    // Too low
    let result = await useCase.execute({
      contractId: '1',
      payload: { age: 17 }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain("Property 'age' must be at least 18");

    // Too high
    result = await useCase.execute({
      contractId: '1',
      payload: { age: 66 }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain("Property 'age' must be at most 65");

    // Valid
    result = await useCase.execute({
      contractId: '1',
      payload: { age: 25 }
    });
    expect(result.value.isValid).toBe(true);
  });

  it('should validate string length (minLength/maxLength)', async () => {
    const props = [
      ContractProp.create({
        name: 'username',
        type: 'string',
        validation: { minLength: 3, maxLength: 10 }
      })
    ];
    mockRepo.findById.mockResolvedValue(createActiveContract(props));

    // Too short
    let result = await useCase.execute({
      contractId: '1',
      payload: { username: 'ab' }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain("Property 'username' length must be at least 3");

    // Too long
    result = await useCase.execute({
      contractId: '1',
      payload: { username: 'verylongusername' }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain("Property 'username' length must be at most 10");

    // Valid
    result = await useCase.execute({
      contractId: '1',
      payload: { username: 'user1' }
    });
    expect(result.value.isValid).toBe(true);
  });

  it('should validate regex pattern', async () => {
    const props = [
      ContractProp.create({
        name: 'email',
        type: 'string',
        validation: { pattern: '^\\S+@\\S+\\.\\S+$' }
      })
    ];
    mockRepo.findById.mockResolvedValue(createActiveContract(props));

    // Invalid format
    let result = await useCase.execute({
      contractId: '1',
      payload: { email: 'invalid-email' }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors[0]).toContain("Property 'email' format is invalid");

    // Valid format
    result = await useCase.execute({
      contractId: '1',
      payload: { email: 'test@example.com' }
    });
    expect(result.value.isValid).toBe(true);
  });

  it('should validate enum values', async () => {
    const props = [
      ContractProp.create({
        name: 'role',
        type: 'string',
        validation: { enum: ['admin', 'user', 'guest'] }
      })
    ];
    mockRepo.findById.mockResolvedValue(createActiveContract(props));

    // Invalid enum
    let result = await useCase.execute({
      contractId: '1',
      payload: { role: 'superuser' }
    });
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain("Property 'role' must be one of: admin, user, guest");

    // Valid enum
    result = await useCase.execute({
      contractId: '1',
      payload: { role: 'admin' }
    });
    expect(result.value.isValid).toBe(true);
  });
});
