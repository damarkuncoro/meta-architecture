import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationPipeline } from '../../../src/application/validation/ValidationPipeline';
import { UniqueNameRule } from '../../../src/application/validation/rules/UniqueNameRule';
import { CompatibilityCheckRule } from '../../../src/application/validation/rules/CompatibilityCheckRule';
import { CustomLogicValidationRule } from '../../../src/application/validation/rules/CustomLogicValidationRule';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { Result } from '../../../src/shared/result';

// Mock Sandbox
const mockValidateCode = vi.fn();
const mockSandbox = {
  validateCode: mockValidateCode
} as any;

describe('ValidationPipeline', () => {
  let pipeline: ValidationPipeline;
  let validContract: ContractEntity;
  let context: any;

  beforeEach(() => {
    pipeline = new ValidationPipeline({
      rules: [
        new UniqueNameRule(),
        new CompatibilityCheckRule(),
        new CustomLogicValidationRule(mockSandbox)
      ]
    });
    context = {
      environment: 'test',
      existingContracts: [],
      userPermissions: [],
      registryStats: { totalContracts: 0, activeContracts: 0 }
    };

    validContract = ContractEntity.create({
      id: 'ui.button', // Manual ID for stable testing
      name: 'button',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'size', type: 'size', values: ['sm'] })],
      props: [ContractProp.create({ name: 'label', type: 'string' })]
    });

    // Mock successful sandbox validation by default
    mockValidateCode.mockResolvedValue(Result.success([]));
  });

  it('should validate a correct contract', async () => {
    const result = await pipeline.validateContract(validContract, context);
    
    expect(result.isSuccess).toBe(true);
    expect(result.value.isValid).toBe(true);
    expect(result.value.errors).toHaveLength(0);
  });

  it('should fail on missing required properties', async () => {
    // Create invalid contract definition
    const invalidDefinition = {
      name: 'invalid',
      category: ContractCategory.UI_COMPONENT.value,
      variants: [], // Empty variants
      props: [] // Empty props
    };

    const result = await pipeline.validateContractDefinition(invalidDefinition, context);

    expect(result.isSuccess).toBe(true);
    expect(result.value.isValid).toBe(false);
    expect(result.value.errors.some(e => e.code === 'SCHEMA_VALIDATION_ERROR' && e.details?.path === 'props')).toBe(true);
    expect(result.value.errors.some(e => e.code === 'SCHEMA_VALIDATION_ERROR' && e.details?.path === 'variants')).toBe(true);
  });

  it('should enforce unique name', async () => {
    const existingContract = ContractEntity.create({
      name: 'button', // Same name
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p', type: 'string' })]
    });

    context.existingContracts = [existingContract];

    const result = await pipeline.validateContract(validContract, context);

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors.some(e => e.code === 'DUPLICATE_CONTRACT_NAME')).toBe(true);
  });

  it('should detect similar names (warning)', async () => {
    const similarContract = ContractEntity.create({
      name: 'buttonn', // Typo-like similarity
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p', type: 'string' })]
    });

    context.existingContracts = [similarContract];

    const result = await pipeline.validateContract(validContract, context);

    expect(result.value.isValid).toBe(true); // Warnings don't invalidate
    expect(result.value.warnings.some(e => e.code === 'SIMILAR_CONTRACT_NAMES')).toBe(true);
  });

  it('should validate custom validator security', async () => {
    // Contract with custom validator
    const secureContract = ContractEntity.create({
      name: 'secure-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v', type: 'size', values: ['s'] })],
      props: [ContractProp.create({ name: 'p', type: 'string' })],
      validation: [{ type: 'custom', target: 'all', params: { script: 'dangerous()' } }]
    });

    // Mock security violation
    mockValidateCode.mockResolvedValue(Result.success([
      { type: 'forbidden_syntax', description: 'Forbidden call', severity: 'high' }
    ]));

    const result = await pipeline.validateContract(secureContract, context);

    expect(result.value.isValid).toBe(false);
    expect(result.value.errors.some(e => e.code === 'CUSTOM_VALIDATION_VIOLATION')).toBe(true);
  });

  it('should detect XSS in contract definition', async () => {
    const xssDefinition = {
      ...validContract.toJSON(),
      description: '<script>alert(1)</script>'
    };

    const result = await pipeline.validateContractDefinition(xssDefinition, context);

    // Security check runs even if schema is valid
    expect(result.value.security.isSecure).toBe(false);
    expect(result.value.security.vulnerabilities.some(v => v.type === 'xss')).toBe(true);
  });

  it('should add and remove rules', () => {
    const customRule = {
      name: 'test-rule',
      description: 'Test',
      category: 'business' as const,
      severity: 'error' as const,
      validate: async () => null
    };

    pipeline.addRule(customRule);
    expect((pipeline as any).rules).toContain(customRule);

    pipeline.removeRule('test-rule');
    expect((pipeline as any).rules).not.toContain(customRule);
  });
});
