import { ITransactionPlugin, TransactionContext } from '../../../src/application/validation/interfaces/ITransactionPlugin';
import { Result } from '../../../src/shared/result';
import { TransactionPluginFactory } from '../../../src/application/validation/TransactionPluginFactory';

/**
 * Example Plugin: External Balance Check
 * Checks if the user has sufficient balance for the transaction
 */
export class ExternalBalanceCheckPlugin implements ITransactionPlugin {
  readonly name = 'external-balance-check';
  readonly version = '1.0.0';

  async validate(context: TransactionContext): Promise<Result<void, string>> {
    const { payload, userContext } = context;

    // Check if this contract requires balance check
    if (!context.contract.props.some(p => p.name === 'amount')) {
      return Result.success(undefined);
    }

    const amount = payload['amount'];
    const userId = userContext?.userId;

    if (!userId) {
      // If no user context, we might skip or fail depending on policy.
      // Here we assume it's required if amount is present.
      return Result.failure('User ID required for balance check');
    }

    if (typeof amount !== 'number') {
        return Result.failure('Amount must be a number');
    }

    // Simulate external API call
    const hasBalance = await this.mockExternalApiCall(userId, amount);

    if (!hasBalance) {
      return Result.failure(`Insufficient balance for user ${userId}`);
    }

    return Result.success(undefined);
  }

  private async mockExternalApiCall(userId: string, amount: number): Promise<boolean> {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 10));
    // Simulate logic: User 'rich_user' always has balance, others have max 1000
    if (userId === 'rich_user') return true;
    return amount <= 1000;
  }
}

// Register automatically
TransactionPluginFactory.registerPluginType('external-balance-check', ExternalBalanceCheckPlugin);
