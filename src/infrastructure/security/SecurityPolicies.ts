import { ISecurityPolicy, SandboxContext, SecurityRule } from '../../domain/services/security/interfaces';

/**
 * Built-in security policies
 */
export class SecurityPolicies {
  /**
   * No dangerous code execution
   */
  static readonly NO_EVAL: ISecurityPolicy = {
    name: 'no-eval',
    description: 'Prevents use of eval() and similar dangerous functions',
    checkViolation: (code: string) => {
      if (code.includes('eval(') || code.includes('Function(') || code.includes('setTimeout(') || code.includes('setInterval(')) {
        return {
          type: 'unsafe_code',
          severity: 'critical',
          description: 'Code contains potentially dangerous function calls',
          recommendation: 'Remove eval(), Function(), setTimeout(), and setInterval() calls'
        };
      }
      return null;
    },
    getRules: () => [{
      id: 'no-eval',
      name: 'No Eval',
      description: 'Prevents eval() usage',
      severity: 'critical',
      pattern: /eval\s*\(/g,
      recommendation: 'Remove eval() calls'
    }]
  };

  /**
   * No access to sensitive globals
   */
  static readonly NO_SENSITIVE_GLOBALS: ISecurityPolicy = {
    name: 'no-sensitive-globals',
    description: 'Prevents access to sensitive global objects',
    checkViolation: (code: string) => {
      const sensitiveGlobals = ['process', 'global', 'window', 'document', 'localStorage', 'sessionStorage', '__dirname', '__filename'];
      for (const global of sensitiveGlobals) {
        if (code.includes(global)) {
          return {
            type: 'unsafe_code',
            severity: 'high',
            description: `Code accesses sensitive global: ${global}`,
            recommendation: `Avoid accessing global object: ${global}`
          };
        }
      }
      return null;
    },
    getRules: () => [{
      id: 'no-sensitive-globals',
      name: 'No Sensitive Globals',
      description: 'Prevents access to sensitive global objects',
      severity: 'high',
      pattern: /\b(process|global|window|document|localStorage|sessionStorage|__dirname|__filename)\b/g,
      recommendation: 'Avoid accessing sensitive global objects'
    }]
  };

  /**
   * No infinite loops or resource exhaustion
   */
  static readonly NO_INFINITE_LOOPS: ISecurityPolicy = {
    name: 'no-infinite-loops',
    description: 'Detects potential infinite loops',
    checkViolation: (code: string) => {
      // Simple heuristic - look for loops without clear exit conditions
      const loopPatterns = [
        /for\s*\(\s*;\s*;\s*\)/g, // for (;;)
        /while\s*\(\s*true\s*\)/g, // while (true)
        /do\s*\{[^}]*\}\s*while\s*\(\s*true\s*\)/g // do {} while (true)
      ];

      for (const pattern of loopPatterns) {
        if (pattern.test(code)) {
          return {
            type: 'resource_exhaustion',
            severity: 'high',
            description: 'Code contains potential infinite loop',
            recommendation: 'Ensure all loops have proper exit conditions'
          };
        }
      }
      return null;
    },
    getRules: () => [{
      id: 'no-infinite-loops',
      name: 'No Infinite Loops',
      description: 'Detects potential infinite loops',
      severity: 'high',
      pattern: /for\s*\(\s*;\s*;\s*\)|while\s*\(\s*true\s*\)|do\s*\{[^}]*\}\s*while\s*\(\s*true\s*\)/g,
      recommendation: 'Ensure all loops have proper exit conditions'
    }]
  };

  /**
   * No malicious patterns
   */
  static readonly NO_MALICIOUS_PATTERNS: ISecurityPolicy = {
    name: 'no-malicious-patterns',
    description: 'Detects common malicious code patterns',
    checkViolation: (code: string) => {
      const maliciousPatterns = [
        /require\s*\(\s*['"`]fs['"`]\s*\)/g, // File system access
        /require\s*\(\s*['"`]child_process['"`]\s*\)/g, // Process execution
        /require\s*\(\s*['"`]http['"`]\s*\)/g, // HTTP requests
        /require\s*\(\s*['"`]https['"`]\s*\)/g, // HTTPS requests
        /process\.exit/g, // Process termination
        /process\.kill/g, // Process killing
        /Buffer\./g, // Buffer manipulation
        /atob\(|btoa\(/g // Base64 encoding/decoding
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(code)) {
          return {
            type: 'malicious_pattern',
            severity: 'critical',
            description: 'Code contains potentially malicious patterns',
            recommendation: 'Remove dangerous code patterns and external dependencies'
          };
        }
      }
      return null;
    },
    getRules: () => [{
      id: 'no-malicious-patterns',
      name: 'No Malicious Patterns',
      description: 'Detects common malicious code patterns',
      severity: 'critical',
      pattern: /require\s*\(\s*['"`](fs|child_process|http|https)['"`]\s*\)|process\.(exit|kill)|Buffer\.|atob\(|btoa\(/g,
      recommendation: 'Remove dangerous code patterns and external dependencies'
    }]
  };

  /**
   * No browser XSS vectors
   */
  static readonly NO_BROWSER_XSS: ISecurityPolicy = {
    name: 'no-browser-xss',
    description: 'Detects common browser XSS vectors',
    checkViolation: (code: string) => {
      const dangerousPatterns = [
        { pattern: /<script/i, type: 'xss', description: 'Script tag detected' },
        { pattern: /javascript:/i, type: 'xss', description: 'JavaScript URL detected' },
        { pattern: /on\w+\s*=/i, type: 'xss', description: 'Event handler detected' },
        { pattern: /innerHTML/i, type: 'xss', description: 'InnerHTML manipulation' }
      ];

      for (const { pattern, type, description } of dangerousPatterns) {
        if (pattern.test(code)) {
          return {
            type: type as any,
            severity: 'high',
            description,
            recommendation: 'Remove dangerous code patterns'
          };
        }
      }
      return null;
    },
    getRules: () => [{
      id: 'no-browser-xss',
      name: 'No Browser XSS',
      description: 'Detects common browser XSS vectors',
      severity: 'high',
      pattern: /<script|javascript:|on\w+\s*=|innerHTML/i,
      recommendation: 'Remove dangerous code patterns'
    }]
  };
}
