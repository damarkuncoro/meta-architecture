/**
 * Cache key generation strategies
 */
export class CacheKeyGenerator {
  /**
   * Generate cache key for contract by ID
   */
  static contractById(id: string): string {
    return `contract:id:${id}`;
  }

  /**
   * Generate cache key for contract by name
   */
  static contractByName(name: string): string {
    return `contract:name:${name}`;
  }

  /**
   * Generate cache key for contract existence check
   */
  static contractExists(contractId: string): string {
    return `contract:exists:${contractId}`;
  }

  /**
   * Generate cache key for contracts by category
   */
  static contractsByCategory(category: string): string {
    return `contracts:category:${category}`;
  }

  /**
   * Generate cache key for active contracts
   */
  static activeContracts(): string {
    return 'contracts:active';
  }

  /**
   * Generate cache key for all contracts
   */
  static allContracts(): string {
    return 'contracts:all';
  }

  /**
   * Generate cache key for validation result
   */
  static validationResult(contractId: string, contextHash: string): string {
    return `validation:${contractId}:${contextHash}`;
  }

  /**
   * Generate cache key for schema validation
   */
  static schemaValidation(definitionHash: string): string {
    return `schema-validation:${definitionHash}`;
  }

  /**
   * Generate hash for validation context
   */
  static hashValidationContext(context: {
    existingContracts: string[];
    environment: string;
    userPermissions: string[];
    registryStats: { totalContracts: number; activeContracts: number };
  }): string {
    const contextStr = JSON.stringify({
      existingContracts: context.existingContracts.sort(),
      environment: context.environment,
      userPermissions: context.userPermissions.sort(),
      registryStats: context.registryStats
    });
    return this.simpleHash(contextStr);
  }

  /**
   * Generate hash for contract definition
   */
  static hashContractDefinition(definition: any): string {
    const definitionStr = JSON.stringify(definition);
    return this.simpleHash(definitionStr);
  }

  /**
   * Simple hash function for cache keys
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
