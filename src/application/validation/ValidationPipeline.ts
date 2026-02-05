import { ContractEntity } from '../../domain/entities/ContractEntity';
import {
  ContractDefinitionValidator,
  SchemaValidationError,
  SchemaValidationWarning
} from '../../schemas';
import { Result } from '../../shared/result';
import { ValidationError } from '../../domain/errors/ValidationError';
import { PerformanceMonitor } from './PerformanceMonitor';
import { SecurityValidator } from './SecurityValidator';
import { ValidationPluginRegistry } from './ValidationPluginRegistry';
import { ValidationLogger } from './ValidationLogger';
import {
  ValidationResult,
  ValidationMetadata,
  ValidationRule,
  ValidationContext
} from './interfaces';
import {
  ValidationPlugin,
  ValidationPluginConfig
} from './interfaces/ValidationPlugin';
import {
  ValidationMonitoringHooks
} from './interfaces/ValidationLogger';

/**
 * Validation Pipeline Configuration
 */
export interface ValidationPipelineConfig {
  performanceMonitor?: PerformanceMonitor;
  securityValidator?: SecurityValidator;
  rules?: ValidationRule[];
  pluginRegistry?: ValidationPluginRegistry;
  logger?: ValidationLogger;
  monitoringHooks?: ValidationMonitoringHooks;
}

/**
 * Comprehensive Validation Pipeline
 * Orchestrates multiple validation layers for enterprise-grade contract validation
 */
export class ValidationPipeline {
  private rules: ValidationRule[] = [];
  private performanceMonitor: PerformanceMonitor;
  private securityValidator: SecurityValidator;
  private pluginRegistry: ValidationPluginRegistry;
  private logger: ValidationLogger;
  private monitoringHooks?: ValidationMonitoringHooks;

  constructor(config: ValidationPipelineConfig = {}) {
    this.performanceMonitor = config.performanceMonitor || new PerformanceMonitor();
    this.securityValidator = config.securityValidator || new SecurityValidator();
    this.pluginRegistry = config.pluginRegistry || new ValidationPluginRegistry();
    this.logger = config.logger || new ValidationLogger();
    this.monitoringHooks = config.monitoringHooks;

    if (config.rules) {
      this.rules = config.rules;
    }
  }

  /**
   * Add a validation rule to the pipeline
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a validation rule
   */
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Register a validation plugin
   */
  async registerPlugin(plugin: ValidationPlugin, config: ValidationPluginConfig): Promise<void> {
    await this.pluginRegistry.register(plugin, config);

    this.logger.info(`Plugin registered: ${plugin.metadata.name}`, {
      pluginName: plugin.metadata.name,
      version: plugin.metadata.version,
      enabled: config.enabled,
      priority: config.priority
    });

    this.monitoringHooks?.onPluginChange?.({
      action: 'loaded',
      pluginName: plugin.metadata.name,
      pluginVersion: plugin.metadata.version
    });
  }

  /**
   * Unregister a validation plugin
   */
  async unregisterPlugin(pluginName: string): Promise<void> {
    await this.pluginRegistry.unregister(pluginName);

    this.logger.info(`Plugin unregistered: ${pluginName}`);

    this.monitoringHooks?.onPluginChange?.({
      action: 'unloaded',
      pluginName
    });
  }

  /**
   * Get the logger instance
   */
  getLogger(): ValidationLogger {
    return this.logger;
  }

  /**
   * Get plugin registry statistics
   */
  getPluginStats() {
    return this.pluginRegistry.getStats();
  }

  /**
   * Get all active rules (built-in + plugin rules)
   */
  private getAllActiveRules(): ValidationRule[] {
    const pluginRules = this.pluginRegistry.getAllRules();
    return [...this.rules, ...pluginRules];
  }

  /**
   * Check performance thresholds and trigger monitoring hooks
   */
  private checkPerformanceThresholds(operation: string, performance: any): void {
    const thresholds = {
      validationTime: 2000, // 2 seconds
      percentile95: 1000,  // 1 second p95
      percentile99: 2000,  // 2 seconds p99
      throughput: 10       // 10 validations per second minimum
    };

    if (performance.validationTime > thresholds.validationTime) {
      this.monitoringHooks?.onPerformanceThresholdExceeded?.({
        metric: 'validationTime',
        value: performance.validationTime,
        threshold: thresholds.validationTime,
        operation
      });
    }

    if (performance.percentile95 && performance.percentile95 > thresholds.percentile95) {
      this.monitoringHooks?.onPerformanceThresholdExceeded?.({
        metric: 'percentile95',
        value: performance.percentile95,
        threshold: thresholds.percentile95,
        operation
      });
    }

    if (performance.percentile99 && performance.percentile99 > thresholds.percentile99) {
      this.monitoringHooks?.onPerformanceThresholdExceeded?.({
        metric: 'percentile99',
        value: performance.percentile99,
        threshold: thresholds.percentile99,
        operation
      });
    }

    if (performance.throughput && performance.throughput < thresholds.throughput) {
      this.monitoringHooks?.onPerformanceThresholdExceeded?.({
        metric: 'throughput',
        value: performance.throughput,
        threshold: thresholds.throughput,
        operation
      });
    }
  }

  /**
   * Validate a contract through the complete pipeline
   */
  async validateContract(
    contract: ContractEntity,
    context: ValidationContext
  ): Promise<Result<ValidationResult, ValidationError>> {
    const startTime = Date.now();
    const operation = `validate_contract_${contract.id}`;

    // Log validation start
    this.logger.logValidationStart(operation, {
      contractId: contract.id,
      contractName: contract.name.value,
      category: contract.category.value
    });

    // Monitoring hook
    this.monitoringHooks?.onValidationStart?.({
      operation,
      contractId: contract.id,
      contractName: contract.name.value,
      rulesCount: this.getAllActiveRules().length
    });

    try {
      this.performanceMonitor.start();

      // Get all active rules (built-in + plugin rules)
      const allRules = this.getAllActiveRules();

      // Execute all validation rules in parallel with individual timing
      const rulePromises = allRules.map(async (rule, index) => {
        const ruleStartTime = Date.now();
        try {
          const result = await rule.validate(contract, context);
          const executionTime = Date.now() - ruleStartTime;
          this.performanceMonitor.recordRuleExecution(rule.name, executionTime, result === null);
          return { index, result, executionTime, success: result === null };
        } catch (error) {
          const executionTime = Date.now() - ruleStartTime;
          this.performanceMonitor.recordRuleExecution(rule.name, executionTime, false);
          return { index, result: error, executionTime, success: false };
        }
      });

      const ruleResults = await Promise.allSettled(rulePromises);

      // Collect results
      const { errors, warnings } = this.processRuleResults(ruleResults);

      // Create rule breakdown for performance metrics
      const ruleBreakdown = ruleResults.map((result, i) => {
        if (result.status === 'fulfilled') {
          return {
            ruleName: allRules[i].name,
            executionTime: result.value.executionTime,
            success: result.value.success
          };
        } else {
          return {
            ruleName: allRules[i].name,
            executionTime: 0,
            success: false
          };
        }
      });

      // Calculate enhanced performance metrics
      const performance = this.performanceMonitor.calculateMetrics(startTime, allRules.length, ruleBreakdown);

      // Security validation
      const security = await this.securityValidator.validate(contract);

      // Create result
      const validationResult = this.createValidationResult(
        errors,
        warnings,
        performance,
        security,
        context,
        contract.contractVersion
      );

      this.performanceMonitor.end();

      const duration = Date.now() - startTime;
      const success = validationResult.isValid;

      // Log validation completion
      this.logger.logValidationEnd(operation, duration, success, {
        errorsCount: validationResult.errors.length,
        warningsCount: validationResult.warnings.length,
        performance: validationResult.performance
      });

      // Monitoring hook
      this.monitoringHooks?.onValidationComplete?.({
        operation,
        duration,
        success,
        errorsCount: validationResult.errors.length,
        warningsCount: validationResult.warnings.length,
        performance: validationResult.performance
      });

      // Check performance thresholds
      this.checkPerformanceThresholds(operation, validationResult.performance);

      return Result.success(validationResult);

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log validation failure
      this.logger.logValidationEnd(operation, duration, false, {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.handleError(error, 'VALIDATION_PIPELINE_ERROR');
    }
  }

  /**
   * Validate contract definition (JSON schema + business rules)
   */
  async validateContractDefinition(
    definition: any,
    context: ValidationContext
  ): Promise<Result<ValidationResult, ValidationError>> {
    try {
      // First, validate against JSON schema
      const schemaResult = ContractDefinitionValidator.validate(definition);

      // If schema validation fails, return early
      if (!schemaResult.isValid) {
        return this.handleSchemaFailure(schemaResult, definition, context);
      }

      // Schema is valid, now validate as contract entity
      const contract = ContractEntity.create(definition);
      return this.validateContract(contract, context);

    } catch (error) {
      return this.handleError(error, 'CONTRACT_DEFINITION_VALIDATION_ERROR');
    }
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    totalRules: number;
    builtInRules: number;
    pluginRules: number;
    rulesByCategory: Record<string, number>;
    averageExecutionTime: number;
    errorRate: number;
    throughput: number;
    percentile95: number;
    percentile99: number;
    pluginStats: any;
  } {
    const allRules = this.getAllActiveRules();
    const rulesByCategory: Record<string, number> = {};

    allRules.forEach(rule => {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
    });

    return {
      totalRules: allRules.length,
      builtInRules: this.rules.length,
      pluginRules: this.pluginRegistry.getAllRules().length,
      rulesByCategory,
      averageExecutionTime: this.performanceMonitor.getAverageExecutionTime(),
      errorRate: this.performanceMonitor.getErrorRate(),
      throughput: this.performanceMonitor.getThroughput(),
      percentile95: this.performanceMonitor.getPercentile95(),
      percentile99: this.performanceMonitor.getPercentile99(),
      pluginStats: this.getPluginStats()
    };
  }

  // Private methods

  private processRuleResults(ruleResults: PromiseSettledResult<{ index: number; result: unknown; executionTime: number; success: boolean }>[]): { errors: ValidationError[], warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    ruleResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { result: ruleResult, index } = result.value;
        if (ruleResult) {
          const error = ruleResult as ValidationError;
          if (this.rules[index].severity === 'error') {
            errors.push(error);
          } else if (this.rules[index].severity === 'warning') {
            warnings.push(error);
          }
        }
      } else if (result.status === 'rejected') {
        // Rule execution failed - treat as error
        const index = ruleResults.indexOf(result);
        errors.push(new ValidationError(
          `Validation rule '${this.rules[index]?.name || 'unknown'}' failed: ${result.reason}`,
          'VALIDATION_RULE_EXECUTION_ERROR',
          { ruleName: this.rules[index]?.name || 'unknown', error: result.reason }
        ));
      }
    });

    return { errors, warnings };
  }

  private async handleSchemaFailure(
    schemaResult: any,
    definition: any,
    context: ValidationContext
  ): Promise<Result<ValidationResult, ValidationError>> {
    const schemaErrors = schemaResult.errors.map((error: SchemaValidationError) =>
      new ValidationError(
        error.message,
        'SCHEMA_VALIDATION_ERROR',
        { path: error.path, value: error.value }
      )
    );

    const schemaWarnings = schemaResult.warnings.map((warning: SchemaValidationWarning) =>
      new ValidationError(
        warning.message,
        'SCHEMA_VALIDATION_WARNING',
        { path: warning.path, value: warning.value }
      )
    );

    const performance = this.performanceMonitor.calculateMetrics(Date.now(), 0);
    const security = await this.securityValidator.validate(definition);

    return Result.success(this.createValidationResult(
      schemaErrors,
      schemaWarnings,
      performance,
      security,
      context,
      definition.version || 'unknown'
    ));
  }

  private createValidationResult(
    errors: ValidationError[],
    warnings: ValidationError[],
    performance: any,
    security: any,
    context: ValidationContext,
    contractVersion: string
  ): ValidationResult {
    const metadata: ValidationMetadata = {
      validatorVersion: '2.0.0',
      validationTimestamp: new Date(),
      contractVersion,
      rulesVersion: '1.0.0',
      environment: context.environment
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance,
      security,
      metadata
    };
  }

  private handleError(error: unknown, code: string): Result<ValidationResult, ValidationError> {
    return Result.failure(new ValidationError(
      `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
      code,
      { originalError: error }
    ));
  }
}
