import { describe, it, expect } from 'vitest';
import { CacheKeyGenerator } from '../../../../src/domain/services/caching/CacheKeyGenerator';

describe('CacheKeyGenerator', () => {
  it('should generate contractById key', () => {
    expect(CacheKeyGenerator.contractById('123')).toBe('contract:id:123');
  });

  it('should generate contractByName key', () => {
    expect(CacheKeyGenerator.contractByName('test')).toBe('contract:name:test');
  });

  it('should generate contractsByCategory key', () => {
    expect(CacheKeyGenerator.contractsByCategory('ui')).toBe('contracts:category:ui');
  });

  it('should generate activeContracts key', () => {
    expect(CacheKeyGenerator.activeContracts()).toBe('contracts:active');
  });

  it('should generate allContracts key', () => {
    expect(CacheKeyGenerator.allContracts()).toBe('contracts:all');
  });

  it('should generate validationResult key', () => {
    expect(CacheKeyGenerator.validationResult('123', 'hash123')).toBe('validation:123:hash123');
  });

  it('should generate schemaValidation key', () => {
    expect(CacheKeyGenerator.schemaValidation('defHash')).toBe('schema-validation:defHash');
  });

  it('should generate deterministic hash for validation context', () => {
    const context = {
      existingContracts: ['b', 'a'],
      environment: 'prod',
      userPermissions: ['write', 'read'],
      registryStats: { totalContracts: 10, activeContracts: 5 }
    };
    
    const hash1 = CacheKeyGenerator.hashValidationContext(context);
    
    // Different order should result in same hash because of sorting in implementation
    const context2 = {
      existingContracts: ['a', 'b'],
      environment: 'prod',
      userPermissions: ['read', 'write'],
      registryStats: { totalContracts: 10, activeContracts: 5 }
    };
    const hash2 = CacheKeyGenerator.hashValidationContext(context2);

    expect(hash1).toBe(hash2);
    expect(hash1).toBeTruthy();
  });
});
