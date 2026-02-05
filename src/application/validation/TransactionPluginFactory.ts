import { ITransactionPlugin } from './interfaces/ITransactionPlugin';

type PluginConstructor = new () => ITransactionPlugin;

export interface PluginDefinition {
  type: string;
  config?: Record<string, any>;
}

/**
 * Factory for creating Transaction Validation Plugins
 * Follows the Factory Pattern to decouple plugin creation from usage.
 */
export class TransactionPluginFactory {
  private static pluginTypes: Map<string, PluginConstructor> = new Map();

  /**
   * Register a plugin class with a specific type name
   * @param type The unique type identifier for this plugin class
   * @param constructor The plugin class constructor
   */
  static registerPluginType(type: string, constructor: PluginConstructor): void {
    if (this.pluginTypes.has(type)) {
      console.warn(`[TransactionPluginFactory] Overwriting existing plugin type: ${type}`);
    }
    this.pluginTypes.set(type, constructor);
  }

  /**
   * Create a plugin instance based on the definition
   * @param definition Configuration object specifying type and options
   */
  static create(definition: PluginDefinition): ITransactionPlugin {
    const Constructor = this.pluginTypes.get(definition.type);
    
    if (!Constructor) {
      throw new Error(`[TransactionPluginFactory] Unknown plugin type: ${definition.type}. Make sure to register it first.`);
    }

    // Instantiate the plugin
    // Note: initialize() is called by the Registry, not the Factory
    return new Constructor();
  }

  /**
   * Clear all registered plugin types (useful for testing)
   */
  static clearRegistry(): void {
    this.pluginTypes.clear();
  }
}
