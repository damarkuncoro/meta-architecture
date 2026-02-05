import { SandboxContext } from './SandboxContext';
import { SecurityViolation } from './SecurityViolation';
import { SecurityRule } from './SecurityRule';

export interface ISecurityPolicy {
  /**
   * Name of the security policy
   */
  readonly name: string;

  /**
   * Description of the policy
   */
  readonly description: string;

  /**
   * Check if code violates policy
   */
  checkViolation(code: string, context: SandboxContext): SecurityViolation | null;

  /**
   * Get policy rules
   */
  getRules(): SecurityRule[];
}
