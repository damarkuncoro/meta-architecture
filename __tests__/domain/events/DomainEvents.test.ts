import { describe, it, expect } from 'vitest';
import { 
  ContractCreatedEvent, 
  ContractValidatedEvent, 
  ContractApprovedEvent, 
  ContractActivatedEvent, 
  ContractDeprecatedEvent, 
  ContractArchivedEvent,
  VariantCreatedEvent,
  PropSchemaCreatedEvent
} from '../../../src/domain/events';

describe('Domain Events', () => {
  const timestamp = new Date();
  const contractId = 'test-contract-id';
  const userId = 'user-123';

  it('should create ContractCreatedEvent', () => {
    const event = new ContractCreatedEvent('Test Contract', 'ui.component', contractId, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.contractName).toBe('Test Contract');
    expect(event.category).toBe('ui.component');
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create ContractValidatedEvent', () => {
    const event = new ContractValidatedEvent(contractId, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create ContractApprovedEvent', () => {
    const event = new ContractApprovedEvent(contractId, userId, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.approverId).toBe(userId);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create ContractActivatedEvent', () => {
    const event = new ContractActivatedEvent(contractId, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create ContractDeprecatedEvent', () => {
    const reason = 'Obsolete';
    const event = new ContractDeprecatedEvent(contractId, reason, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.reason).toBe(reason);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create ContractArchivedEvent', () => {
    const reason = 'Old';
    const event = new ContractArchivedEvent(contractId, reason, timestamp);

    expect(event.contractId).toBe(contractId);
    expect(event.reason).toBe(reason);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create VariantCreatedEvent', () => {
    const variantValues = ['sm', 'md', 'lg'];
    const event = new VariantCreatedEvent('size', variantValues, timestamp);

    expect(event.variantType).toBe('size');
    expect(event.variantValues).toBe(variantValues);
    expect(event.timestamp).toBe(timestamp);
  });

  it('should create PropSchemaCreatedEvent', () => {
    const event = new PropSchemaCreatedEvent('label', 'string', true, timestamp);

    expect(event.propName).toBe('label');
    expect(event.propType).toBe('string');
    expect(event.isRequired).toBe(true);
    expect(event.timestamp).toBe(timestamp);
  });
});
