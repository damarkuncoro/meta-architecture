/**
 * Response DTO for transaction validation
 */
export interface ValidateTransactionResponse {
  /**
   * Whether the transaction is valid
   */
  isValid: boolean;

  /**
   * List of validation errors
   */
  errors: string[];

  /**
   * List of validation warnings
   */
  warnings: string[];

  /**
   * Validation processing time in milliseconds
   */
  processingTime: number;

  /**
   * ID of the contract used for validation
   */
  contractId: string;

  /**
   * Version of the contract used
   */
  contractVersion: string;
}
