import { ValidationRule } from './ValidationRule';

/**
 * Plugin metadata interface
 */
export interface ValidationPluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  dependencies?: Record<string, string>;
}

/**
 * Plugin configuration interface
 */
export interface ValidationPluginConfig {
  enabled: boolean;
  priority: number; // Higher priority = executed first
  config?: Record<string, any>;
}

/**
 * Validation plugin interface
 */
export interface ValidationPlugin {
  metadata: ValidationPluginMetadata;
  rules: ValidationRule[];

  /**
   * Initialize the plugin with configuration
   */
  initialize(config: ValidationPluginConfig): Promise<void>;

  /**
   * Cleanup resources when plugin is unloaded
   */
  destroy(): Promise<void>;

  /**
   * Get plugin health status
   */
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message?: string }>;
}

/**
 * Plugin loader interface for dynamic loading
 */
export interface ValidationPluginLoader {
  /**
   * Load a plugin from a source (file path, URL, etc.)
   */
  loadPlugin(source: string, config?: ValidationPluginConfig): Promise<ValidationPlugin>;

  /**
   * Unload a plugin
   */
  unloadPlugin(pluginName: string): Promise<void>;

  /**
   * List available plugins
   */
  listAvailablePlugins(): Promise<string[]>;

  /**
   * Get plugin metadata without loading
   */
  getPluginMetadata(source: string): Promise<ValidationPluginMetadata>;
}

/**
 * Plugin registry for managing loaded plugins
 */
export interface ValidationPluginRegistry {
  /**
   * Register a plugin
   */
  register(plugin: ValidationPlugin, config: ValidationPluginConfig): Promise<void>;

  /**
   * Unregister a plugin
   */
  unregister(pluginName: string): Promise<void>;

  /**
   * Get a registered plugin
   */
  getPlugin(pluginName: string): ValidationPlugin | undefined;

  /**
   * List all registered plugins
   */
  listPlugins(): string[];

  /**
   * Get combined rules from all enabled plugins
   */
  getAllRules(): ValidationRule[];

  /**
   * Reload plugin configuration
   */
  reloadPluginConfig(pluginName: string, config: ValidationPluginConfig): Promise<void>;
}