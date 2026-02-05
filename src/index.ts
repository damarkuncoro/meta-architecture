// Contract Architecture - Enterprise-grade Clean Architecture Implementation
// This package provides a complete architectural foundation for contract-based UI systems

// Domain Layer - Pure Business Logic
export * from './domain';

// Application Layer - Use Cases
export * from './application';

// Infrastructure Layer - Implementations
export * from './infrastructure';

// Shared Utilities
export { Result } from './shared/result';

// Schema Validation
export {
  STANDARD_CONTRACT_SCHEMA,
  ContractDefinitionValidator,
  type ContractDefinitionSchema,
  type SchemaValidationResult
} from './schemas';

// Main exports for easy consumption
export { ContractEntity } from './domain/entities/ContractEntity';
export { CreateContractUseCase } from './application/use-cases/CreateContractUseCase';