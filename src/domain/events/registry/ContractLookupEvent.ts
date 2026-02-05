import { ContractRegistryEvent } from './ContractRegistryEvent';

export class ContractLookupEvent extends ContractRegistryEvent {
  constructor(
    contractId: string,
    public readonly result: 'found' | 'not_found',
    public readonly lookupType: 'id' | 'name' | 'category',
    timestamp?: Date
  ) {
    super('ContractLookup', contractId, timestamp);
  }
}
