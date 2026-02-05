import { TransactionPluginRegistry } from './TransactionPluginRegistry';
import { TransactionPluginFactory, PluginDefinition } from './TransactionPluginFactory';

export class PluginLoaderService {
  constructor(private readonly registry: TransactionPluginRegistry) {}

  /**
   * Load plugins based on a list of definitions
   * @param definitions List of plugin configurations
   */
  async loadPlugins(definitions: PluginDefinition[]): Promise<void> {
    for (const def of definitions) {
      try {
        const plugin = TransactionPluginFactory.create(def);
        await this.registry.register(plugin, def.config);
        console.log(`[PluginLoader] Successfully loaded plugin: ${def.type}`);
      } catch (error) {
        console.error(`[PluginLoader] Failed to load plugin ${def.type}:`, error);
        // We might want to throw or continue depending on strictness requirements
        // For now, we log and continue
      }
    }
  }
}
