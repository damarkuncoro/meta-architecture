export class VariantCreatedEvent {
  constructor(
    public readonly variantType: string,
    public readonly variantValues: string[],
    public readonly timestamp: Date = new Date()
  ) {}
}
