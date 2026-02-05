import * as vm from 'vm';
import {
  ISandbox,
  SandboxContext,
  SandboxResult,
  SecurityViolation,
  ExecutionOptions,
  SanitizationRules,
  SandboxStats,
  ISecurityPolicy
} from '../../domain/services/security/interfaces';
import { SecurityPolicies } from './SecurityPolicies';
import { InputSanitizer } from './InputSanitizer';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';

/**
 * Safe Sandbox Implementation
 * Provides security sandboxing for contract execution and validation
 * Uses static analysis and input sanitization for security
 */
export class SafeSandbox implements ISandbox {
  private stats: SandboxStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    securityViolations: 0,
    averageExecutionTime: 0,
    peakMemoryUsage: 0,
    timeouts: 0,
    resourceExhaustions: 0
  };

  private policies: ISecurityPolicy[] = [
    SecurityPolicies.NO_EVAL,
    SecurityPolicies.NO_SENSITIVE_GLOBALS,
    SecurityPolicies.NO_INFINITE_LOOPS,
    SecurityPolicies.NO_MALICIOUS_PATTERNS
  ];

  /**
   * Execute code safely in sandbox
   */
  async execute<T = any>(
    code: string,
    context: SandboxContext = this.getDefaultContext(),
    options: ExecutionOptions = {}
  ): Promise<Result<SandboxResult<T>, ValidationError>> {
    const startTime = Date.now();
    this.stats.totalExecutions++;

    try {
      // Validate code first
      const validationResult = await this.validateCode(code, context);
      if (validationResult.isFailure) {
        this.stats.failedExecutions++;
        return Result.failure(validationResult.error);
      }

      const violations = validationResult.value;
      if (violations.length > 0) {
        this.stats.securityViolations += violations.length;
        this.stats.failedExecutions++;

        return Result.success({
          success: false,
          error: `Security violations detected: ${violations.map(v => v.description).join(', ')}`,
          executionTime: Date.now() - startTime,
          memoryUsed: 0,
          securityViolations: violations
        });
      }

      // Check permissions
      const permissionResult = this.checkPermissions('execute', context);
      if (permissionResult.isFailure) {
        this.stats.failedExecutions++;
        return Result.failure(permissionResult.error);
      }

      // Execute code in sandbox (using vm module)
      const result = await this.simulateExecution<T>(code, context, options);

      const executionTime = Date.now() - startTime;
      this.stats.averageExecutionTime =
        (this.stats.averageExecutionTime * (this.stats.totalExecutions - 1) + executionTime) / this.stats.totalExecutions;

      if (result.success) {
        this.stats.successfulExecutions++;
      } else {
        this.stats.failedExecutions++;
      }

      return Result.success({
        ...result,
        executionTime,
        securityViolations: []
      });

    } catch (error) {
      this.stats.failedExecutions++;
      return Result.failure(new ValidationError(
        `Sandbox execution failed: ${error instanceof Error ? error.message : String(error)}`,
        'SANDBOX_EXECUTION_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Validate code for security issues without execution
   */
  async validateCode(
    code: string,
    context: SandboxContext = this.getDefaultContext()
  ): Promise<Result<SecurityViolation[], ValidationError>> {
    try {
      const violations: SecurityViolation[] = [];

      // Check syntax validity
      try {
        new vm.Script(code);
      } catch (error) {
        violations.push({
          type: 'unsafe_code',
          severity: 'critical',
          description: `Syntax Error: ${error instanceof Error ? error.message : String(error)}`,
          recommendation: 'Fix syntax errors in the custom validator code.'
        });
        // If syntax is invalid, further validation might be unreliable or crash, but we can try
      }

      // Apply all security policies
      for (const policy of this.policies) {
        const violation = policy.checkViolation(code, context);
        if (violation) {
          violations.push(violation);
        }
      }

      // Additional custom validation
      const customViolations = this.performCustomValidation(code, context);
      violations.push(...customViolations);

      return Result.success(violations);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Code validation failed: ${error instanceof Error ? error.message : String(error)}`,
        'CODE_VALIDATION_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(
    input: any,
    rules: SanitizationRules = {}
  ): Result<any, ValidationError> {
    try {
      // Determine input type and apply appropriate sanitization
      if (typeof input === 'string') {
        return InputSanitizer.sanitizeString(input, rules);
      }

      if (typeof input === 'object' && input !== null) {
        return InputSanitizer.sanitizeObject(input, rules);
      }

      // For other types, apply basic validation
      if (rules.allowedTypes && !rules.allowedTypes.includes(typeof input)) {
        return Result.failure(new ValidationError(
          `Input type '${typeof input}' is not allowed`,
          'INVALID_INPUT_TYPE',
          { allowedTypes: rules.allowedTypes, actualType: typeof input }
        ));
      }

      return Result.success(input);

    } catch (error) {
      return Result.failure(new ValidationError(
        `Input sanitization failed: ${error instanceof Error ? error.message : String(error)}`,
        'SANITIZATION_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Check permissions for operation
   */
  checkPermissions(
    operation: string,
    context: SandboxContext
  ): Result<boolean, ValidationError> {
    // Simple permission checking based on environment and user permissions
    const requiredPermissions = this.getRequiredPermissions(operation, context.environment);

    for (const required of requiredPermissions) {
      if (!context.userPermissions.includes(required)) {
        return Result.failure(new ValidationError(
          `Permission denied: '${required}' required for operation '${operation}'`,
          'PERMISSION_DENIED',
          { operation, requiredPermission: required, userPermissions: context.userPermissions }
        ));
      }
    }

    return Result.success(true);
  }

  /**
   * Get sandbox statistics
   */
  getStats(): SandboxStats {
    return { ...this.stats };
  }

  /**
   * Reset sandbox state
   */
  async reset(): Promise<void> {
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      securityViolations: 0,
      averageExecutionTime: 0,
      peakMemoryUsage: 0,
      timeouts: 0,
      resourceExhaustions: 0
    };
  }

  /**
   * Add a security policy
   */
  addPolicy(policy: ISecurityPolicy): void {
    this.policies.push(policy);
  }

  /**
   * Remove a security policy
   */
  removePolicy(policyName: string): void {
    this.policies = this.policies.filter(p => p.name !== policyName);
  }

  // Private methods

  private getDefaultContext(): SandboxContext {
    return {
      timeout: 5000, // 5 seconds
      memoryLimit: 50 * 1024 * 1024, // 50MB
      allowedModules: [],
      allowedGlobals: ['console', 'Math', 'Date', 'JSON'],
      environment: 'development',
      userPermissions: ['read', 'execute'],
      resourceLimits: {
        maxCpuTime: 1000, // 1 second
        maxHeapSize: 50 * 1024 * 1024, // 50MB
        maxStackSize: 1024 * 1024 // 1MB
      }
    };
  }

  private async simulateExecution<T>(
    code: string,
    context: SandboxContext,
    options: ExecutionOptions
  ): Promise<SandboxResult<T>> {
    const startTime = Date.now();

    try {
      // Prepare sandbox environment
      const sandboxEnv = {
        ...options.context, // Inject provided context (e.g. payload)
        console: context.allowedGlobals.includes('console') ? console : undefined,
        Math: context.allowedGlobals.includes('Math') ? Math : undefined,
        Date: context.allowedGlobals.includes('Date') ? Date : undefined,
        JSON: context.allowedGlobals.includes('JSON') ? JSON : undefined,
      };

      // Create script
      const script = new vm.Script(code);

      // Execute with timeout
      const result = script.runInNewContext(sandboxEnv, {
        timeout: context.timeout,
        displayErrors: true
      });

      return {
        success: true,
        result: result as T,
        executionTime: Date.now() - startTime,
        memoryUsed: 0, // Difficult to measure precisely in pure JS
        securityViolations: []
      };

    } catch (error) {
      // Check for timeout explicitly if error message suggests it
      if (error instanceof Error && error.message.includes('Script execution timed out')) {
         this.stats.timeouts++;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        securityViolations: []
      };
    }
  }

  private performCustomValidation(code: string, context: SandboxContext): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check code complexity (simple heuristic)
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const complexity = lines + functions * 10;

    if (complexity > 100) {
      violations.push({
        type: 'resource_exhaustion',
        severity: 'medium',
        description: 'Code complexity may cause performance issues',
        recommendation: 'Simplify code or break into smaller functions'
      });
    }

    return violations;
  }

  private getRequiredPermissions(operation: string, environment: string): string[] {
    const basePermissions = ['read'];

    switch (operation) {
      case 'execute':
        return [...basePermissions, 'execute'];
      case 'write':
        return [...basePermissions, 'write'];
      case 'admin':
        return [...basePermissions, 'admin'];
      default:
        return basePermissions;
    }
  }
}
