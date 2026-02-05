export class ContractCreatedEvent {
  constructor(
    public readonly contractName: string,
    public readonly category: string,
    public readonly contractId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
