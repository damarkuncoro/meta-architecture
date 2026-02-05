import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TransactionPluginFactory } from '../../../src/application/validation/TransactionPluginFactory';
import { ITransactionPlugin, TransactionContext } from '../../../src/application/validation/interfaces/ITransactionPlugin';
import { Result } from '../../../src/shared/result';

// Mock Plugin Implementation
class MockPlugin implements ITransactionPlugin {
  readonly name = 'mock-plugin';
  readonly version = '1.0.0';

  async validate(context: TransactionContext): Promise<Result<void, string>> {
    return Result.success(undefined);
  }
}

class AnotherMockPlugin implements ITransactionPlugin {
  readonly name = 'another-mock';
  readonly version = '1.0.0';

  async validate(context: TransactionContext): Promise<Result<void, string>> {
    return Result.success(undefined);
  }
}

describe('TransactionPluginFactory', () => {
  beforeEach(() => {
    TransactionPluginFactory.clearRegistry();
  });

  it('should register and create a plugin instance', () => {
    // Register
    TransactionPluginFactory.registerPluginType('mock', MockPlugin);

    // Create
    const plugin = TransactionPluginFactory.create({ type: 'mock' });

    expect(plugin).toBeInstanceOf(MockPlugin);
    expect(plugin.name).toBe('mock-plugin');
  });

  it('should throw error for unknown plugin type', () => {
    expect(() => {
      TransactionPluginFactory.create({ type: 'unknown' });
    }).toThrow('[TransactionPluginFactory] Unknown plugin type: unknown');
  });

  it('should allow overwriting plugin types with warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    TransactionPluginFactory.registerPluginType('mock', MockPlugin);
    TransactionPluginFactory.registerPluginType('mock', AnotherMockPlugin);

    const plugin = TransactionPluginFactory.create({ type: 'mock' });
    expect(plugin).toBeInstanceOf(AnotherMockPlugin);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Overwriting existing plugin type'));

    consoleSpy.mockRestore();
  });
});
