import { ContractRegistryEvent } from './ContractRegistryEvent';

export class ContractUnregisteredEvent extends ContractRegistryEvent {
  constructor(
    contractId: string,
    public readonly contractName: string,
    public readonly category: string,
    timestamp?: Date
  ) {
    super('ContractUnregistered', contractId, timestamp);
  }
}
