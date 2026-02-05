import { describe, it, expect } from 'vitest';
import { ContractEntity } from '../../../src/domain/entities/ContractEntity';
import { ContractCategory } from '../../../src/domain/value-objects/ContractCategory';
import { ContractVariant } from '../../../src/domain/entities/ContractVariant';
import { ContractProp } from '../../../src/domain/entities/ContractProp';

describe('ContractEntity Serialization', () => {
  it('should serialize and deserialize a contract correctly', () => {
    // Create a test contract
    const originalContract = ContractEntity.create({
      id: 'test-contract-123',
      name: 'test-button',
      category: ContractCategory.UI_COMPONENT,
      variants: [
        ContractVariant.create({
          name: 'size',
          type: 'size',
          values: ['small', 'medium', 'large'],
          defaultValue: 'medium'
        })
      ],
      props: [
        ContractProp.create({
          name: 'label',
          type: 'string',
          required: true
        }),
        ContractProp.create({
          name: 'disabled',
          type: 'boolean',
          defaultValue: false
        })
      ],
      description: 'A test button component'
    });

    // Serialize to JSON
    const json = originalContract.toJSON();
    expect(json).toBeDefined();
    expect(json.id).toBe('test-contract-123');
    expect(json.name).toBe('test-button');
    expect(json.category).toBe('ui.component');

    // Deserialize from JSON
    const deserializedContract = ContractEntity.fromJSON(json);
    expect(deserializedContract).toBeDefined();
    expect(deserializedContract.id).toBe(originalContract.id);
    expect(deserializedContract.name.value).toBe(originalContract.name.value);
    expect(deserializedContract.category.value).toBe(originalContract.category.value);
    expect(deserializedContract.variants).toHaveLength(1);
    expect(deserializedContract.props).toHaveLength(2);
  });

  it('should handle invalid JSON gracefully', () => {
    expect(() => ContractEntity.fromJSON(null)).toThrow('Invalid JSON data: must be an object');
    expect(() => ContractEntity.fromJSON({})).toThrow('Invalid JSON data: missing or invalid id');
    expect(() => ContractEntity.fromJSON({ id: 123 })).toThrow('Invalid JSON data: missing or invalid id');
    expect(() => ContractEntity.fromJSON({ id: 'test' })).toThrow('Invalid JSON data: missing or invalid name');
  });

  it('should preserve contract status and version', () => {
    const contract = ContractEntity.create({
      name: 'status-test',
      category: ContractCategory.UI_COMPONENT,
      variants: [ContractVariant.create({ name: 'v', type: 'size', values: ['val'] })],
      props: [ContractProp.create({ name: 'p', type: 'string' })]
    });

    // Mark as validated
    contract.markAsValidated();

    const json = contract.toJSON();
    const deserialized = ContractEntity.fromJSON(json);

    expect(deserialized.status.value).toBe('validated');
    expect(deserialized.contractVersion).toBe(contract.contractVersion);
  });
});