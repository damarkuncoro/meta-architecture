import { ContractRegistryEvent } from './ContractRegistryEvent';

export class RegistryErrorEvent extends ContractRegistryEvent {
  constructor(
    contractId: string,
    public readonly operation: string,
    public readonly error: string,
    timestamp?: Date
  ) {
    super('RegistryError', contractId, timestamp);
  }
}
