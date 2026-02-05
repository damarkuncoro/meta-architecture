export class ContractArchivedEvent {
  constructor(
    public readonly contractId: string,
    public readonly reason?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
