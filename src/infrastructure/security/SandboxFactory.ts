import { ISandbox } from '../../domain/services/security/interfaces';
import { SafeSandbox } from './SafeSandbox';

/**
 * Sandbox factory for creating sandbox instances
 */
export class SandboxFactory {
  /**
   * Create a development sandbox with relaxed security
   */
  static createDevelopmentSandbox(): ISandbox {
    const sandbox = new SafeSandbox();

    // Remove strict policies for development
    sandbox.removePolicy('no-eval');
    sandbox.removePolicy('no-malicious-patterns');

    return sandbox;
  }

  /**
   * Create a production sandbox with strict security
   */
  static createProductionSandbox(): ISandbox {
    const sandbox = new SafeSandbox();

    // Add additional production policies
    sandbox.addPolicy({
      name: 'production-security',
      description: 'Additional security checks for production',
      checkViolation: (code: string) => {
        // Production-specific checks
        if (code.includes('console.log') || code.includes('debugger')) {
          return {
            type: 'unsafe_code',
            severity: 'medium',
            description: 'Debug code detected in production',
            recommendation: 'Remove console.log and debugger statements'
          };
        }
        return null;
      },
      getRules: () => []
    });

    return sandbox;
  }

  /**
   * Create a minimal sandbox for basic validation
   */
  static createMinimalSandbox(): ISandbox {
    const sandbox = new SafeSandbox();

    // Remove most policies for minimal validation
    sandbox.removePolicy('no-infinite-loops');
    sandbox.removePolicy('no-malicious-patterns');

    return sandbox;
  }
}
