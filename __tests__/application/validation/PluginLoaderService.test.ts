import { describe, it, expect, beforeEach } from 'vitest';
import { PluginLoaderService } from '../../../src/application/validation/PluginLoaderService';
import { TransactionPluginRegistry } from '../../../src/application/validation/TransactionPluginRegistry';
import { TransactionPluginFactory } from '../../../src/application/validation/TransactionPluginFactory';
import { ExternalBalanceCheckPlugin } from '../../fixtures/plugins/ExternalBalanceCheckPlugin';
import { FraudDetectionPlugin } from '../../fixtures/plugins/FraudDetectionPlugin';

describe('PluginLoaderService', () => {
  let registry: TransactionPluginRegistry;
  let loader: PluginLoaderService;

  beforeEach(() => {
    // Clear factory and re-register plugins to ensure clean state
    TransactionPluginFactory.clearRegistry();
    TransactionPluginFactory.registerPluginType('external-balance-check', ExternalBalanceCheckPlugin);
    TransactionPluginFactory.registerPluginType('fraud-detection', FraudDetectionPlugin);

    registry = new TransactionPluginRegistry();
    loader = new PluginLoaderService(registry);
  });

  it('should load multiple plugins from definitions', async () => {
    const definitions = [
      { type: 'external-balance-check' },
      { 
        type: 'fraud-detection', 
        config: { strictMode: true, blacklistedIps: ['1.1.1.1'] } 
      }
    ];

    await loader.loadPlugins(definitions);

    const registeredPlugins = registry.getRegisteredPlugins();
    expect(registeredPlugins).toContain('external-balance-check');
    expect(registeredPlugins).toContain('fraud-detection');
    expect(registeredPlugins.length).toBe(2);
  });

  it('should handle unknown plugins gracefully', async () => {
    const definitions = [
      { type: 'unknown-plugin' },
      { type: 'external-balance-check' }
    ];

    // Should not throw
    await loader.loadPlugins(definitions);

    const registeredPlugins = registry.getRegisteredPlugins();
    expect(registeredPlugins).toContain('external-balance-check');
    expect(registeredPlugins).not.toContain('unknown-plugin');
    expect(registeredPlugins.length).toBe(1);
  });
});
