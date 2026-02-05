export abstract class ContractRegistryEvent {
  constructor(
    public readonly eventType: string,
    public readonly contractId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
