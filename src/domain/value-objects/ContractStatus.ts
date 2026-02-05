import { ValueObject } from '../shared/ValueObject';

/**
 * Contract Status Value Object
 * Defines the lifecycle status of a contract
 */
export class ContractStatus extends ValueObject {
  static readonly DRAFT = new ContractStatus('draft');
  static readonly VALIDATED = new ContractStatus('validated');
  static readonly APPROVED = new ContractStatus('approved');
  static readonly ACTIVE = new ContractStatus('active');
  static readonly DEPRECATED = new ContractStatus('deprecated');
  static readonly ARCHIVED = new ContractStatus('archived');

  private constructor(private readonly _value: string) {
    super();
  }

  /**
   * Creates a ContractStatus from string
   */
  static fromString(value: string): ContractStatus {
    switch (value.toLowerCase()) {
      case 'draft': return ContractStatus.DRAFT;
      case 'validated': return ContractStatus.VALIDATED;
      case 'approved': return ContractStatus.APPROVED;
      case 'active': return ContractStatus.ACTIVE;
      case 'deprecated': return ContractStatus.DEPRECATED;
      case 'archived': return ContractStatus.ARCHIVED;
      default: throw new Error(`Invalid contract status: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }

  get isDraft(): boolean {
    return this._value === 'draft';
  }

  get isValidated(): boolean {
    return this._value === 'validated';
  }

  get isApproved(): boolean {
    return this._value === 'approved';
  }

  get isActive(): boolean {
    return this._value === 'active';
  }

  get isDeprecated(): boolean {
    return this._value === 'deprecated';
  }

  get isArchived(): boolean {
    return this._value === 'archived';
  }

  protected getEqualityProperties(): any[] {
    return [this._value];
  }

  toString(): string {
    return `ContractStatus(${this._value})`;
  }
}