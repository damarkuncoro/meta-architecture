import { ITransactionPlugin, TransactionContext } from '../../../src/application/validation/interfaces/ITransactionPlugin';
import { Result } from '../../../src/shared/result';
import { TransactionPluginFactory } from '../../../src/application/validation/TransactionPluginFactory';

/**
 * Example Plugin: Fraud Detection
 * Checks for suspicious activity based on context
 */
export class FraudDetectionPlugin implements ITransactionPlugin {
  readonly name = 'fraud-detection';
  readonly version = '1.0.0';

  private blacklistedIps: Set<string> = new Set(['1.2.3.4', '10.0.0.666']);
  private config: Record<string, any> = {};

  async initialize(config: Record<string, any>): Promise<void> {
    this.config = config;
    if (config.blacklistedIps && Array.isArray(config.blacklistedIps)) {
        config.blacklistedIps.forEach((ip: string) => this.blacklistedIps.add(ip));
    }
  }

  async validate(context: TransactionContext): Promise<Result<void, string>> {
    const { userContext } = context;

    if (!userContext) {
        // If strict mode is enabled in config, fail if no user context
        if (this.config.strictMode) {
            return Result.failure('User context required for fraud detection');
        }
        return Result.success(undefined);
    }

    const userIp = userContext.ip;

    if (userIp && this.blacklistedIps.has(userIp)) {
        return Result.failure(`Transaction blocked: Suspicious IP ${userIp}`);
    }

    // Check velocity (mock)
    if (this.config.maxVelocity && userContext.transactionCount > this.config.maxVelocity) {
        return Result.failure('Transaction blocked: Velocity limit exceeded');
    }

    return Result.success(undefined);
  }
}

// Register automatically
TransactionPluginFactory.registerPluginType('fraud-detection', FraudDetectionPlugin);
