import { BaseEntity } from '../shared/BaseEntity';
import { ContractConfiguration } from '../value-objects/ContractConfiguration';

/**
 * Contract Instance Entity
 * Represents a specific configuration/usage of a Contract Definition
 */
export class ContractInstanceEntity extends BaseEntity {
  private readonly _contractId: string;
  private readonly _configuration: ContractConfiguration;
  
  private constructor(
    id: string,
    contractId: string,
    configuration: ContractConfiguration
  ) {
    super(id);
    this._contractId = contractId;
    this._configuration = configuration;
  }

  /**
   * Creates a new Contract Instance
   */
  static create(
    contractId: string,
    configuration: ContractConfiguration
  ): ContractInstanceEntity {
    const id = `instance-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
    return new ContractInstanceEntity(id, contractId, configuration);
  }

  get contractId(): string { return this._contractId; }
  get configuration(): ContractConfiguration { return this._configuration; }
  
  // createdAt is available via BaseEntity
}
