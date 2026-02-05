import { describe, it, expect } from 'vitest';
import { ContractAccessibility } from '../../../src/domain/entities/ContractAccessibility';

describe('ContractAccessibility', () => {
  it('should create valid accessibility config', () => {
    const access = ContractAccessibility.create({
      supported: true,
      roles: ['button'],
      keyboardActions: ['Enter', 'Space'],
      ariaAttributes: ['aria-label']
    });

    expect(access.supported).toBe(true);
    expect(access.roles).toContain('button');
    expect(access.keyboardActions).toContain('Enter');
    expect(access.ariaAttributes).toContain('aria-label');
  });

  it('should create default config', () => {
    const access = ContractAccessibility.create({});
    expect(access.supported).toBe(false);
    expect(access.roles).toHaveLength(0);
    expect(access.keyboardActions).toHaveLength(0);
    expect(access.ariaAttributes).toBeUndefined();
  });

  it('should handle undefined input', () => {
    const access = ContractAccessibility.create(undefined);
    expect(access.supported).toBe(false);
  });

  it('should be immutable', () => {
    const access = ContractAccessibility.create({ roles: ['button'] });
    // @ts-ignore
    expect(() => access.roles.push('link')).toThrow();
  });

  it('should validate configuration', () => {
    const supported = ContractAccessibility.create({
      supported: true,
      roles: ['button'],
      keyboardActions: ['Enter']
    });
    expect(supported.isProperlyConfigured).toBe(true);

    const unsupported = ContractAccessibility.create({ supported: false });
    expect(unsupported.isProperlyConfigured).toBe(true);

    const incomplete = ContractAccessibility.create({
      supported: true,
      roles: [],
      keyboardActions: []
    });
    expect(incomplete.isProperlyConfigured).toBe(false);
  });

  it('should check equality', () => {
    const a1 = ContractAccessibility.create({ supported: true, roles: ['button'] });
    const a2 = ContractAccessibility.create({ supported: true, roles: ['button'] });
    const a3 = ContractAccessibility.create({ supported: true, roles: ['link'] });

    expect(a1.equals(a2)).toBe(true);
    expect(a1.equals(a3)).toBe(false);
  });
});
