import { describe, it, expect } from 'vitest';
import { ContractStatus } from '../../../src/domain/value-objects/ContractStatus';

describe('ContractStatus', () => {
  it('should create valid statuses', () => {
    expect(ContractStatus.fromString('draft')).toEqual(ContractStatus.DRAFT);
    expect(ContractStatus.fromString('validated')).toEqual(ContractStatus.VALIDATED);
    expect(ContractStatus.fromString('approved')).toEqual(ContractStatus.APPROVED);
    expect(ContractStatus.fromString('active')).toEqual(ContractStatus.ACTIVE);
    expect(ContractStatus.fromString('deprecated')).toEqual(ContractStatus.DEPRECATED);
    expect(ContractStatus.fromString('archived')).toEqual(ContractStatus.ARCHIVED);
  });

  it('should throw error for invalid status', () => {
    expect(() => ContractStatus.fromString('invalid')).toThrow('Invalid contract status');
  });

  it('should be case insensitive', () => {
    expect(ContractStatus.fromString('DRAFT')).toEqual(ContractStatus.DRAFT);
  });

  it('should correctly identify status flags', () => {
    expect(ContractStatus.DRAFT.isDraft).toBe(true);
    expect(ContractStatus.VALIDATED.isValidated).toBe(true);
    expect(ContractStatus.APPROVED.isApproved).toBe(true);
    expect(ContractStatus.ACTIVE.isActive).toBe(true);
    expect(ContractStatus.DEPRECATED.isDeprecated).toBe(true);
    expect(ContractStatus.ARCHIVED.isArchived).toBe(true);
  });

  it('should return correct string representation', () => {
    expect(ContractStatus.DRAFT.toString()).toBe('ContractStatus(draft)');
  });
});
