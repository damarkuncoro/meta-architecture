import { ContractEntity } from '../../../domain/entities/ContractEntity';
import { Result } from '../../../shared/result';

/**
 * Context for transaction validation plugins
 */
export interface TransactionContext {
  contract: ContractEntity;
  payload: Record<string, any>;
  userContext?: Record<string, any>;
  timestamp: number;
}

/**
 * Interface for Transaction Validation Plugins
 * Allows external systems to hook into the transaction validation process
 * (e.g., Fraud Detection, Balance Check, Compliance, AML)
 */
export interface ITransactionPlugin {
  /**
   * Plugin name for identification
   */
  readonly name: string;

  /**
   * Plugin version
   */
  readonly version: string;

  /**
   * Execute validation logic
   * Returns Success if valid, Failure with error message if invalid
   */
  validate(context: TransactionContext): Promise<Result<void, string>>;
  
  /**
   * Initialize plugin (optional)
   */
  initialize?(config: Record<string, any>): Promise<void>;

  /**
   * Cleanup plugin (optional)
   */
  destroy?(): Promise<void>;
}
