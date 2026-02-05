import { Result } from '../../../../shared/result/Result';
import { ValidationError } from '../../../errors/ValidationError';
import { SandboxContext } from './SandboxContext';
import { ExecutionOptions } from './ExecutionOptions';
import { SandboxResult } from './SandboxResult';
import { SecurityViolation } from './SecurityViolation';
import { SanitizationRules } from './SanitizationRules';
import { SandboxStats } from './SandboxStats';

/**
 * Security sandbox interface
 */
export interface ISandbox {
  /**
   * Execute code safely in sandbox
   */
  execute<T = any>(
    code: string,
    context?: SandboxContext,
    options?: ExecutionOptions
  ): Promise<Result<SandboxResult<T>, ValidationError>>;

  /**
   * Validate code for security issues without execution
   */
  validateCode(
    code: string,
    context?: SandboxContext
  ): Promise<Result<SecurityViolation[], ValidationError>>;

  /**
   * Sanitize input data
   */
  sanitizeInput(
    input: any,
    rules?: SanitizationRules
  ): Result<any, ValidationError>;

  /**
   * Check permissions for operation
   */
  checkPermissions(
    operation: string,
    context: SandboxContext
  ): Result<boolean, ValidationError>;

  /**
   * Get sandbox statistics
   */
  getStats(): SandboxStats;

  /**
   * Reset sandbox state
   */
  reset(): Promise<void>;
}
