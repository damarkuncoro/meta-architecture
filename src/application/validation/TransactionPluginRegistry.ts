import { ITransactionPlugin, TransactionContext } from './interfaces/ITransactionPlugin';
import { Result } from '../../shared/result';

/**
 * Registry for Transaction Validation Plugins
 * Manages the lifecycle and execution of runtime validation plugins
 */
export class TransactionPluginRegistry {
  private plugins: Map<string, ITransactionPlugin> = new Map();

  /**
   * Register a new plugin
   */
  async register(plugin: ITransactionPlugin, config: Record<string, any> = {}): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    if (plugin.initialize) {
      await plugin.initialize(config);
    }

    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      if (plugin.destroy) {
        await plugin.destroy();
      }
      this.plugins.delete(pluginName);
    }
  }

  /**
   * Execute all registered plugins for a transaction
   * Returns validation errors if any plugin fails
   */
  async executeAll(context: TransactionContext): Promise<string[]> {
    const errors: string[] = [];
    const promises = Array.from(this.plugins.values()).map(plugin => 
      plugin.validate(context)
        .then(result => ({ pluginName: plugin.name, result }))
        .catch(error => ({ 
          pluginName: plugin.name, 
          result: Result.failure<void, string>(`Plugin execution failed: ${error instanceof Error ? error.message : String(error)}`) 
        }))
    );

    const results = await Promise.all(promises);

    for (const { pluginName, result } of results) {
      if (result.isFailure) {
        errors.push(`[${pluginName}] ${result.error}`);
      }
    }

    return errors;
  }

  /**
   * Get list of registered plugins
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
