import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateTransactionUseCase } from '../../../src/application/use-cases/ValidateTransactionUseCase';
import { TransactionPluginRegistry } from '../../../src/application/validation/TransactionPluginRegistry';
import { ExternalBalanceCheckPlugin } from '../../fixtures/plugins/ExternalBalanceCheckPlugin';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractStatus } from '../../../src/domain/value-objects/ContractStatus';
import { ContractLogicExecutor } from '../../../src/domain/services/validation/ContractLogicExecutor';

describe('ValidateTransactionUseCase - Plugin Integration', () => {
  let useCase: ValidateTransactionUseCase;
  let mockRepo: any;
  let mockSandbox: any;
  let registry: TransactionPluginRegistry;
  let logicExecutor: ContractLogicExecutor;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
    };
    mockSandbox = {
      execute: vi.fn(),
    };
    
    registry = new TransactionPluginRegistry();
    logicExecutor = new ContractLogicExecutor(mockSandbox);
    useCase = new ValidateTransactionUseCase(mockRepo, logicExecutor, registry);
  });

  const createActiveContract = () => {
    const contract = ContractEntity.create({
      name: 'payment-contract',
      category: ContractCategory.SERVICE,
      variants: [{ name: 'default', values: { type: 'standard' } } as any],
      props: [
        ContractProp.create({ name: 'amount', type: 'number', required: true })
      ],
    });
    (contract as any)._status = ContractStatus.ACTIVE;
    return contract;
  };

  it('should execute registered plugins', async () => {
    const plugin = new ExternalBalanceCheckPlugin();
    await registry.register(plugin);

    mockRepo.findById.mockResolvedValue(createActiveContract());

    // Case 1: Insufficient Balance
    let result = await useCase.execute({
      contractId: '1',
      payload: { amount: 5000 },
      context: { userId: 'poor_user' }
    });

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain('[external-balance-check] Insufficient balance for user poor_user');

    // Case 2: Sufficient Balance
    result = await useCase.execute({
      contractId: '1',
      payload: { amount: 500 },
      context: { userId: 'poor_user' }
    });

    expect(result.value.isValid).toBe(true);
    expect(result.value.errors).toHaveLength(0);
  });

  it('should handle plugin errors gracefully', async () => {
    const faultyPlugin = {
      name: 'faulty-plugin',
      version: '1.0.0',
      validate: async () => { throw new Error('Boom!'); }
    };
    await registry.register(faultyPlugin);

    mockRepo.findById.mockResolvedValue(createActiveContract());

    const result = await useCase.execute({
      contractId: '1',
      payload: { amount: 100 },
      context: { userId: 'user1' }
    });

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors).toContain('[faulty-plugin] Plugin execution failed: Boom!');
  });
});
