import { ContractRegistryEvent } from './ContractRegistryEvent';

export class ContractRegisteredEvent extends ContractRegistryEvent {
  constructor(
    contractId: string,
    public readonly contractName: string,
    public readonly category: string,
    timestamp?: Date
  ) {
    super('ContractRegistered', contractId, timestamp);
  }
}
