import { BaseEntity } from '../shared/BaseEntity';
import { ContractName } from '../value-objects/ContractName';
import { ContractCategory } from '../value-objects/ContractCategory';
import { ContractStatus } from '../value-objects/ContractStatus';
import { ContractSLA, SLAProps } from '../value-objects/ContractSLA';
import { ContractVariant } from './ContractVariant';
import { ContractProp } from './ContractProp';
import { ContractAccessibility } from './ContractAccessibility';
import { ContractValidation, ValidationRule } from './ContractValidation';
import {
  ContractCreatedEvent,
  ContractValidatedEvent,
  ContractApprovedEvent,
  ContractActivatedEvent,
  ContractDeprecatedEvent,
  ContractArchivedEvent
} from '../events';
import { ContractDefinitionValidator } from '../../schemas';

/**
 * Contract Entity - Pure Domain Entity
 * Represents a contract definition with business rules and invariants
 */
export class ContractEntity extends BaseEntity {
  private readonly _name: ContractName;
  private readonly _category: ContractCategory;
  private _status: ContractStatus;
  private _contractVersion: string;
  private _description?: string;
  private readonly _variants: readonly ContractVariant[];
  private readonly _props: readonly ContractProp[];
  private readonly _slots: readonly string[];
  private readonly _accessibility: ContractAccessibility;
  private readonly _validation: ContractValidation;
  private readonly _sla: ContractSLA;
  private readonly _metadata: Record<string, any>;

  private constructor(
    id: string,
    name: ContractName,
    category: ContractCategory,
    variants: ContractVariant[],
    props: ContractProp[],
    slots: string[],
    accessibility: ContractAccessibility,
    validation: ContractValidation,
    sla: ContractSLA,
    metadata: Record<string, any> = {},
    description?: string
  ) {
    super(id);

    this._name = name;
    this._category = category;
    this._status = ContractStatus.DRAFT;
    this._contractVersion = '1.0.0';
    this._description = description;
    this._variants = Object.freeze([...variants]);
    this._props = Object.freeze([...props]);
    this._slots = Object.freeze([...slots]);
    this._accessibility = accessibility;
    this._validation = validation;
    this._sla = sla;
    this._metadata = { ...metadata };

    this.validateBusinessInvariants();
  }

  /**
   * Creates a new Contract Entity
   */
  static create(params: {
    id?: string;
    name: string;
    category: ContractCategory;
    variants?: ContractVariant[];
    props?: ContractProp[];
    slots?: string[];
    accessibility?: Partial<ContractAccessibility>;
    validation?: Partial<ContractValidation> | ValidationRule[];
    sla?: SLAProps;
    metadata?: Record<string, any>;
    description?: string;
  }): ContractEntity {
    const id = params.id || ContractEntity.generateId();
    const name = ContractName.create(params.name);
    const category = params.category;
    const variants = params.variants || [];
    const props = params.props || [];
    const slots = params.slots || [];
    const accessibility = ContractAccessibility.create(params.accessibility);
    const validation = ContractValidation.create(params.validation);
    const sla = ContractSLA.create(params.sla);

    const contract = new ContractEntity(
      id,
      name,
      category,
      variants,
      props,
      slots,
      accessibility,
      validation,
      sla,
      params.metadata,
      params.description
    );

    // Emit domain event
    contract.addDomainEvent(new ContractCreatedEvent(
      params.name,
      params.category.value,
      id
    ));

    return contract;
  }

  /**
   * Creates a Contract Entity from JSON data
   */
  static fromJSON(json: any): ContractEntity {
    // Validate JSON structure
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data: must be an object');
    }

    if (!json.id || typeof json.id !== 'string') {
      throw new Error('Invalid JSON data: missing or invalid id');
    }

    if (!json.name || typeof json.name !== 'string') {
      throw new Error('Invalid JSON data: missing or invalid name');
    }

    if (!json.category || typeof json.category !== 'string') {
      throw new Error('Invalid JSON data: missing or invalid category');
    }

    // Check version compatibility
    const currentVersion = '2.0.0';
    const jsonVersion = json.version || '1.0.0';

    if (jsonVersion !== currentVersion) {
      // For now, only allow exact version match
      // In future, could implement migration logic
      console.warn(`Version mismatch: JSON version ${jsonVersion}, current version ${currentVersion}. Attempting compatibility...`);
    }

    // Validate against JSON schema
    const schemaResult = ContractDefinitionValidator.validate(json);
    if (!schemaResult.isValid) {
      const errors = schemaResult.errors.map(err => `${err.path}: ${err.message}`).join('; ');
      throw new Error(`JSON schema validation failed: ${errors}`);
    }

    // Reconstruct domain objects
    const name = ContractName.create(json.name);
    const category = ContractCategory.fromString(json.category);

    // Reconstruct variants
    const variants: ContractVariant[] = [];
    if (json.variants && Array.isArray(json.variants)) {
      for (const variantData of json.variants) {
        if (!variantData.name || !variantData.type) {
          throw new Error(`Invalid variant data: ${JSON.stringify(variantData)}`);
        }
        variants.push(ContractVariant.create({
          name: variantData.name,
          type: variantData.type,
          values: variantData.values || [],
          defaultValue: variantData.defaultValue,
          description: variantData.description
        }));
      }
    }

    // Reconstruct props
    const props: ContractProp[] = [];
    if (json.props && Array.isArray(json.props)) {
      for (const propData of json.props) {
        if (!propData.name || !propData.type) {
          throw new Error(`Invalid prop data: ${JSON.stringify(propData)}`);
        }
        props.push(ContractProp.create({
          name: propData.name,
          type: propData.type,
          required: propData.required || false,
          defaultValue: propData.defaultValue,
          description: propData.description,
          validation: propData.validation
        }));
      }
    }

    // Reconstruct slots
    const slots: string[] = [];
    if (json.slots && Array.isArray(json.slots)) {
      slots.push(...json.slots.filter((slot: any) => typeof slot === 'string'));
    }

    // Reconstruct accessibility
    const accessibility = ContractAccessibility.create(json.accessibility || {});

    // Reconstruct validation rules
    let validation: ContractValidation;
    if (json.validation && Array.isArray(json.validation)) {
      // Convert JSON validation rules back to ValidationRule objects
      const rules: ValidationRule[] = json.validation.map((ruleData: any) => ({
        name: ruleData.type || 'custom',
        description: `Deserialized ${ruleData.type} rule`,
        category: 'business' as const,
        severity: 'error' as const,
        validate: async () => null // Placeholder - custom logic would need recreation
      }));
      validation = ContractValidation.create(rules);
    } else {
      validation = ContractValidation.create([]);
    }

    // Reconstruct SLA
    const sla = ContractSLA.create(json.sla);

    // Create the contract entity
    const contract = new ContractEntity(
      json.id,
      name,
      category,
      variants,
      props,
      slots,
      accessibility,
      validation,
      sla,
      json.metadata || {},
      json.description
    );

    // Set status if provided
    if (json.status) {
      const status = ContractStatus.fromString(json.status);
      (contract as any)._status = status;
    }

    // Set version if provided
    if (json.version) {
      (contract as any)._contractVersion = json.version;
    }

    return contract;
  }

  /**
   * Generates a unique ID for the contract
   */
  private static generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `contract-${timestamp}-${random}`;
  }

  /**
   * Validates business invariants
   */
  private validateBusinessInvariants(): void {
    // Contract must have a valid name
    if (!this._name || !this._name.value) {
      throw new Error('Contract must have a valid name');
    }

    // Contract must have at least one variant
    if (this._variants.length === 0) {
      throw new Error('Contract must have at least one variant');
    }

    // Contract must have at least one prop
    if (this._props.length === 0) {
      throw new Error('Contract must have at least one prop');
    }

    // Validate variant uniqueness
    const variantNames = new Set<string>();
    for (const variant of this._variants) {
      if (variantNames.has(variant.name)) {
        throw new Error(`Duplicate variant name: ${variant.name}`);
      }
      variantNames.add(variant.name);
    }

    // Validate prop uniqueness
    const propNames = new Set<string>();
    for (const prop of this._props) {
      if (propNames.has(prop.name)) {
        throw new Error(`Duplicate prop name: ${prop.name}`);
      }
      propNames.add(prop.name);
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): ContractName { return this._name; }
  get category(): ContractCategory { return this._category; }
  get status(): ContractStatus { return this._status; }
  get contractVersion(): string { return this._contractVersion; }
  get description(): string | undefined { return this._description; }
  get variants(): readonly ContractVariant[] { return this._variants; }
  get props(): readonly ContractProp[] { return this._props; }
  get slots(): readonly string[] { return this._slots; }
  get accessibility(): ContractAccessibility { return this._accessibility; }
  get validation(): ContractValidation { return this._validation; }
  get sla(): ContractSLA { return this._sla; }
  get metadata(): Record<string, any> { return this._metadata; }

  /**
   * Marks contract as validated
   */
  markAsValidated(): void {
    if (!this._status.isDraft) {
      throw new Error(`Cannot validate contract in status: ${this._status.value}`);
    }
    
    this._status = ContractStatus.VALIDATED;
    this.addDomainEvent(new ContractValidatedEvent(this.id));
    this.markAsModified();
  }

  /**
   * Approves the contract
   */
  approve(approverId?: string): void {
    if (!this._status.isValidated) {
      throw new Error(`Cannot approve contract that has not been validated. Current status: ${this._status.value}`);
    }

    this._status = ContractStatus.APPROVED;
    this.addDomainEvent(new ContractApprovedEvent(this.id, approverId));
    this.markAsModified();
  }

  /**
   * Activates the contract
   */
  activate(): void {
    if (!this._status.isApproved) {
      throw new Error(`Cannot activate contract that has not been approved. Current status: ${this._status.value}`);
    }

    this._status = ContractStatus.ACTIVE;
    this.addDomainEvent(new ContractActivatedEvent(this.id));
    this.markAsModified();
  }

  /**
   * Deprecates the contract
   */
  deprecate(reason?: string): void {
    if (!this._status.isActive) {
      throw new Error(`Cannot deprecate contract that is not active. Current status: ${this._status.value}`);
    }

    this._status = ContractStatus.DEPRECATED;
    this.addDomainEvent(new ContractDeprecatedEvent(this.id, reason));
    this.markAsModified();
  }

  /**
   * Archives the contract
   */
  archive(reason?: string): void {
    if (!this._status.isDeprecated) {
      throw new Error(`Cannot archive contract that is not deprecated. Current status: ${this._status.value}`);
    }

    this._status = ContractStatus.ARCHIVED;
    this.addDomainEvent(new ContractArchivedEvent(this.id, reason));
    this.markAsModified();
  }

  /**
   * Checks if contract supports a specific variant value
   */
  supportsVariant(variantName: string, value: any): boolean {
    const variant = this._variants.find(v => v.name === variantName);
    if (!variant) return false;

    return variant.supportsValue(value);
  }

  /**
   * Gets a variant by name
   */
  getVariant(name: string): ContractVariant | undefined {
    return this._variants.find(v => v.name === name);
  }

  /**
   * Gets a prop by name
   */
  getProp(name: string): ContractProp | undefined {
    return this._props.find(p => p.name === name);
  }

  /**
   * Converts the entity to a plain JSON object matching the Spec
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name.value,
      category: this.category.value,
      status: this.status.value,
      version: this.contractVersion,
      description: this.description,
      variants: this.variants.map(v => ({
        name: v.name,
        type: v.type,
        values: [...v.values],
        defaultValue: v.defaultValue,
        description: v.description
      })),
      props: this.props.map(p => ({
        name: p.name,
        type: p.type,
        required: p.required,
        defaultValue: p.defaultValue,
        description: p.description,
        validation: p.validation
      })),
      slots: [...this.slots],
      accessibility: {
        supported: this.accessibility.supported,
        roles: [...this.accessibility.roles],
        keyboardActions: [...this.accessibility.keyboardActions],
        ariaAttributes: this.accessibility.ariaAttributes ? [...this.accessibility.ariaAttributes] : undefined
      },
      validation: this.validation.rules.map(r => ({
        type: r.type,
        target: r.target,
        params: r.params ? { ...r.params } : undefined
      })),
      sla: {
        latency: this.sla.latency,
        throughput: this.sla.throughput,
        availability: this.sla.availability
      },
      metadata: { ...this.metadata }
    };
  }
}
