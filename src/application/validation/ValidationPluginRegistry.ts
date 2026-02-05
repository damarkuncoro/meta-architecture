import {
  ValidationPlugin,
  ValidationPluginConfig,
  ValidationPluginRegistry as IValidationPluginRegistry
} from './interfaces/ValidationPlugin';
import { ValidationRule } from './interfaces/ValidationRule';

/**
 * Default implementation of ValidationPluginRegistry
 */
export class ValidationPluginRegistry implements IValidationPluginRegistry {
  private plugins: Map<string, { plugin: ValidationPlugin; config: ValidationPluginConfig }> = new Map();

  async register(plugin: ValidationPlugin, config: ValidationPluginConfig): Promise<void> {
    const pluginName = plugin.metadata.name;

    // Initialize plugin
    await plugin.initialize(config);

    // Store plugin with config
    this.plugins.set(pluginName, { plugin, config });
  }

  async unregister(pluginName: string): Promise<void> {
    const pluginEntry = this.plugins.get(pluginName);
    if (pluginEntry) {
      await pluginEntry.plugin.destroy();
      this.plugins.delete(pluginName);
    }
  }

  getPlugin(pluginName: string): ValidationPlugin | undefined {
    return this.plugins.get(pluginName)?.plugin;
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  getAllRules(): ValidationRule[] {
    const allRules: ValidationRule[] = [];

    // Collect rules from all enabled plugins, sorted by priority
    const enabledPlugins = Array.from(this.plugins.entries())
      .filter(([, { config }]) => config.enabled)
      .sort(([, a], [, b]) => b.config.priority - a.config.priority); // Higher priority first

    for (const [, { plugin }] of enabledPlugins) {
      allRules.push(...plugin.rules);
    }

    return allRules;
  }

  async reloadPluginConfig(pluginName: string, config: ValidationPluginConfig): Promise<void> {
    const pluginEntry = this.plugins.get(pluginName);
    if (!pluginEntry) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }

    // Re-initialize with new config
    await pluginEntry.plugin.initialize(config);
    pluginEntry.config = config;
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    totalPlugins: number;
    enabledPlugins: number;
    totalRules: number;
    plugins: Array<{
      name: string;
      version: string;
      enabled: boolean;
      priority: number;
      ruleCount: number;
    }>;
  } {
    const plugins = Array.from(this.plugins.entries()).map(([name, { plugin, config }]) => ({
      name,
      version: plugin.metadata.version,
      enabled: config.enabled,
      priority: config.priority,
      ruleCount: plugin.rules.length
    }));

    return {
      totalPlugins: this.plugins.size,
      enabledPlugins: plugins.filter(p => p.enabled).length,
      totalRules: this.getAllRules().length,
      plugins
    };
  }
}