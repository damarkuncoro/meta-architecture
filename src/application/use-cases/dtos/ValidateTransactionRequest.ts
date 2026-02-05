/**
 * Request DTO for validating a transaction against a contract
 */
export interface ValidateTransactionRequest {
  /**
   * ID of the contract to validate against
   */
  contractId: string;

  /**
   * Transaction payload to validate
   */
  payload: Record<string, any>;

  /**
   * Optional context for validation (e.g., user info, environment)
   */
  context?: Record<string, any>;
}
