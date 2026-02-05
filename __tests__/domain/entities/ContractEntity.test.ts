import { describe, it, expect, beforeEach } from 'vitest';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';
import { ContractStatus } from '../../../src/domain/value-objects/ContractStatus';

describe('ContractEntity', () => {
  let validParams: any;

  beforeEach(() => {
    validParams = {
      name: 'test-contract',
      category: ContractCategory.UI_COMPONENT,
      variants: [
        ContractVariant.create({
          name: 'size',
          type: 'size',
          values: ['sm', 'md', 'lg'],
          defaultValue: 'md'
        })
      ],
      props: [
        ContractProp.create({
          name: 'label',
          type: 'string',
          required: true
        })
      ]
    };
  });

  it('should create a valid contract in DRAFT status', () => {
    const contract = ContractEntity.create(validParams);

    expect(contract.name.value).toBe('test-contract');
    expect(contract.category).toEqual(ContractCategory.UI_COMPONENT);
    expect(contract.status).toEqual(ContractStatus.DRAFT);
    expect(contract.variants.length).toBe(1);
    expect(contract.props.length).toBe(1);
  });

  it('should throw error if missing name', () => {
    expect(() => ContractEntity.create({ ...validParams, name: '' })).toThrow();
  });

  it('should throw error if no variants', () => {
    expect(() => ContractEntity.create({ ...validParams, variants: [] })).toThrow('Contract must have at least one variant');
  });

  it('should throw error if no props', () => {
    expect(() => ContractEntity.create({ ...validParams, props: [] })).toThrow('Contract must have at least one prop');
  });

  it('should validate lifecycle transitions', () => {
    const contract = ContractEntity.create(validParams);

    // Draft -> Validated
    contract.markAsValidated();
    expect(contract.status).toEqual(ContractStatus.VALIDATED);

    // Validated -> Approved
    contract.approve('approver-1');
    expect(contract.status).toEqual(ContractStatus.APPROVED);

    // Approved -> Active
    contract.activate();
    expect(contract.status).toEqual(ContractStatus.ACTIVE);

    // Active -> Deprecated
    contract.deprecate('Reason');
    expect(contract.status).toEqual(ContractStatus.DEPRECATED);

    // Deprecated -> Archived
    contract.archive('Reason');
    expect(contract.status).toEqual(ContractStatus.ARCHIVED);
  });

  it('should prevent invalid transitions', () => {
    const contract = ContractEntity.create(validParams);

    // Draft -> Approved (Invalid)
    expect(() => contract.approve('user')).toThrow();
    
    // Draft -> Active (Invalid)
    expect(() => contract.activate()).toThrow();
  });

  it('should emit events on transitions', () => {
    const contract = ContractEntity.create(validParams);
    
    // Clear initial creation event
    contract.clearDomainEvents();

    contract.markAsValidated();
    const events = contract.getDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].constructor.name).toBe('ContractValidatedEvent');
  });
});
