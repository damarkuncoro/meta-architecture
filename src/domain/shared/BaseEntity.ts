/**
 * Base Entity class for all domain entities
 * Provides common entity behavior and domain event support
 */
export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;
  protected _version: number;
  private _domainEvents: any[] = [];

  constructor(id: string) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._version = 1;
  }

  /**
   * Marks the entity as modified
   */
  protected markAsModified(): void {
    this._updatedAt = new Date();
    this._version++;
  }

  /**
   * Adds a domain event
   */
  protected addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  /**
   * Gets and clears domain events
   */
  public getDomainEvents(): any[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /**
   * Clears domain events
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get version(): number {
    return this._version;
  }

  /**
   * Checks equality by ID
   */
  equals(other: BaseEntity): boolean {
    return other && other.constructor === this.constructor && other._id === this._id;
  }
}