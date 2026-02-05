import { ContractEntity } from '../../domain/entities/ContractEntity';
import { ValidationResult, ValidationResultUtils } from '../validation/interfaces/ValidationResult';

/**
 * ContractSerializer - Utility class for contract and validation result serialization
 *
 * Provides a clean API for serializing and deserializing contracts and validation results
 * with proper error handling and type safety.
 */
export class ContractSerializer {
  /**
   * Serializes a ContractEntity to JSON string
   */
  static serializeContract(contract: ContractEntity): string {
    try {
      const json = contract.toJSON();
      return JSON.stringify(json, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deserializes a JSON string to ContractEntity
   */
  static deserializeContract(jsonString: string): ContractEntity {
    try {
      const json = JSON.parse(jsonString);
      return ContractEntity.fromJSON(json);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`Failed to deserialize contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Serializes a ValidationResult to JSON string
   */
  static serializeValidationResult(result: ValidationResult): string {
    try {
      const json = ValidationResultUtils.toJSON(result);
      return JSON.stringify(json, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize validation result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deserializes a JSON string to ValidationResult
   */
  static deserializeValidationResult(jsonString: string): ValidationResult {
    try {
      const json = JSON.parse(jsonString);
      return ValidationResultUtils.fromJSON(json);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`Failed to deserialize validation result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Serializes multiple contracts to JSON string
   */
  static serializeContracts(contracts: ContractEntity[]): string {
    try {
      const jsonArray = contracts.map(contract => contract.toJSON());
      return JSON.stringify(jsonArray, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize contracts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deserializes a JSON string to array of ContractEntity
   */
  static deserializeContracts(jsonString: string): ContractEntity[] {
    try {
      const jsonArray = JSON.parse(jsonString);
      if (!Array.isArray(jsonArray)) {
        throw new Error('Expected JSON array for contracts');
      }
      return jsonArray.map(json => ContractEntity.fromJSON(json));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`Failed to deserialize contracts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates if a JSON string represents a valid contract
   */
  static validateContractJson(jsonString: string): { isValid: boolean; error?: string } {
    try {
      const json = JSON.parse(jsonString);
      // Try to create contract to validate structure
      ContractEntity.fromJSON(json);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validates if a JSON string represents a valid validation result
   */
  static validateValidationResultJson(jsonString: string): { isValid: boolean; error?: string } {
    try {
      const json = JSON.parse(jsonString);
      // Try to create validation result to validate structure
      ValidationResultUtils.fromJSON(json);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Gets serialization statistics
   */
  static getStats(): {
    supportedFormats: string[];
    compressionEnabled: boolean;
    maxBatchSize: number;
  } {
    return {
      supportedFormats: ['json'],
      compressionEnabled: false, // Could be enhanced with compression
      maxBatchSize: 1000 // Reasonable limit for batch operations
    };
  }
}
