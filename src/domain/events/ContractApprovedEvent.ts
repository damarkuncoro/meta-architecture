export class ContractApprovedEvent {
  constructor(
    public readonly contractId: string,
    public readonly approverId?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
