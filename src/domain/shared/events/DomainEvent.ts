import { 
  ContractCreatedEvent, 
  ContractValidatedEvent, 
  ContractApprovedEvent,
  ContractActivatedEvent, 
  ContractDeprecatedEvent, 
  ContractArchivedEvent,
  VariantCreatedEvent, 
  PropSchemaCreatedEvent,
  ContractRegistryEvent
} from '../../events';

/**
 * Base domain event type
 */
export type DomainEvent = ContractCreatedEvent | ContractValidatedEvent | ContractApprovedEvent | ContractActivatedEvent | ContractDeprecatedEvent | ContractArchivedEvent | VariantCreatedEvent | PropSchemaCreatedEvent | ContractRegistryEvent;
