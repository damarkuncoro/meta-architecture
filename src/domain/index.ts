// Domain Layer - Pure Business Logic
// This layer contains all business rules, entities, value objects, and domain services

// Entities
export { ContractEntity } from './entities/ContractEntity';
export { ContractInstanceEntity } from './entities/ContractInstanceEntity';
export { ContractVariant } from './entities/ContractVariant';
export { ContractProp } from './entities/ContractProp';
export { ContractAccessibility } from './entities/ContractAccessibility';
export { ContractValidation } from './entities/ContractValidation';

// Value Objects
export { ContractName } from './value-objects/ContractName';
export { ContractCategory } from './value-objects/ContractCategory';
export { ContractStatus } from './value-objects/ContractStatus';
export { ContractSLA } from './value-objects/ContractSLA';
export { ContractConfiguration } from './value-objects/ContractConfiguration';

// Domain Events
export * from './events';

// Domain Errors
export { ValidationError } from './errors/ValidationError';

// Repositories
export type { IContractRepository } from './repositories/IContractRepository';
export type { IContractInstanceRepository } from './repositories/IContractInstanceRepository';

// Domain Services
export * from './services/caching';

// Shared Domain Infrastructure
export { BaseEntity } from './shared/BaseEntity';
export { ValueObject } from './shared/ValueObject';

// Type exports for external use
export type { ContractVariant as IContractVariant } from './entities/ContractVariant';
export type { ContractProp as IContractProp } from './entities/ContractProp';
export type { ContractAccessibility as IContractAccessibility } from './entities/ContractAccessibility';
export type { ContractValidation as IContractValidation } from './entities/ContractValidation';