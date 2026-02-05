import { ValueObject } from '../shared/ValueObject';

/**
 * Contract Accessibility Value Object
 * Defines accessibility requirements for a contract
 */
export class ContractAccessibility extends ValueObject {
  constructor(
    public readonly supported: boolean,
    public readonly roles: string[],
    public readonly keyboardActions: string[],
    public readonly ariaAttributes?: string[]
  ) {
    super();
    Object.freeze(this.roles);
    Object.freeze(this.keyboardActions);
    if (this.ariaAttributes) Object.freeze(this.ariaAttributes);
    Object.freeze(this);
  }

  /**
   * Creates a ContractAccessibility instance
   */
  static create(params: Partial<ContractAccessibility> = {}): ContractAccessibility {
    return new ContractAccessibility(
      params.supported || false,
      params.roles || [],
      params.keyboardActions || [],
      params.ariaAttributes
    );
  }

  /**
   * Checks if accessibility is properly configured
   */
  get isProperlyConfigured(): boolean {
    if (!this.supported) return true; // Not supported, so no configuration needed

    return this.roles.length > 0 && this.keyboardActions.length > 0;
  }

  protected getEqualityProperties(): any[] {
    return [this.supported, this.roles, this.keyboardActions, this.ariaAttributes];
  }

  toString(): string {
    return `ContractAccessibility(supported: ${this.supported})`;
  }
}