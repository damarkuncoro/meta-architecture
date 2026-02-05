import { ContractRegistryEvent } from './ContractRegistryEvent';

export class RegistryRefreshEvent extends ContractRegistryEvent {
  constructor(
    contractId: string,
    public readonly contractsLoaded: number,
    public readonly categoriesUpdated: number,
    timestamp?: Date
  ) {
    super('RegistryRefresh', contractId, timestamp);
  }
}
