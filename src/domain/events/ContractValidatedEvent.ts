export class ContractValidatedEvent {
  constructor(
    public readonly contractId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
