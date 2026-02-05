export class PropSchemaCreatedEvent {
  constructor(
    public readonly propName: string,
    public readonly propType: string,
    public readonly isRequired: boolean,
    public readonly timestamp: Date = new Date()
  ) {}
}
