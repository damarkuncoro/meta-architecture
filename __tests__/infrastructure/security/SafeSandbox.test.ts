import { describe, it, expect, beforeEach } from 'vitest';
import { SafeSandbox } from '../../../src/infrastructure/security/SafeSandbox';
import { SandboxContext } from '../../../src/domain/services/security/interfaces';

describe('SafeSandbox', () => {
  let sandbox: SafeSandbox;

  beforeEach(() => {
    sandbox = new SafeSandbox();
  });

  describe('execute', () => {
    it('should execute valid code successfully', async () => {
      const code = '1 + 1';
      const result = await sandbox.execute(code);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.success).toBe(true);
        expect(result.value.result).toBe(2);
      }
    });

    it('should return security violations for unsafe code (eval)', async () => {
      const code = 'eval("1 + 1")';
      const result = await sandbox.execute(code);

      expect(result.isSuccess).toBe(true); // Returns success but with success: false in result
      if (result.isSuccess) {
        expect(result.value.success).toBe(false);
        expect(result.value.securityViolations.length).toBeGreaterThan(0);
        expect(result.value.securityViolations[0].type).toBe('unsafe_code');
      }
    });

    it('should handle syntax errors', async () => {
      const code = 'if (true {'; // Missing parenthesis
      const result = await sandbox.execute(code);

      // validateCode returns failure for syntax errors?
      // Let's check validateCode impl. It pushes to violations for syntax error.
      // And execute returns Result.success with violations if any.
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.success).toBe(false);
        expect(result.value.securityViolations[0].type).toBe('unsafe_code');
        expect(result.value.securityViolations[0].description).toContain('Syntax Error');
      }
    });

    it('should access context variables', async () => {
      const code = 'amount * 2';
      const options = {
        context: { amount: 10 }
      };
      const result = await sandbox.execute(code, undefined, options);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.result).toBe(20);
      }
    });

    it('should enforce timeout', async () => {
      // Create an infinite loop
      const code = 'while(true) {}';
      const context: SandboxContext = {
        timeout: 100, // 100ms
        memoryLimit: 1024 * 1024,
        allowedModules: [],
        allowedGlobals: [],
        environment: 'development',
        userPermissions: ['read', 'execute'],
        resourceLimits: { maxCpuTime: 100, maxHeapSize: 1024 * 1024, maxStackSize: 1024 }
      };

      const result = await sandbox.execute(code, context);

      expect(result.isSuccess).toBe(true); // Should catch error inside simulateExecution
      if (result.isSuccess) {
        expect(result.value.success).toBe(false);
        // It might be caught by static analysis (infinite loop policy) OR runtime timeout
        const errorMsg = result.value.error || result.value.securityViolations[0]?.description || '';
        expect(errorMsg).toMatch(/timed out|infinite loop/i);
      }
    });
  });

  describe('sanitizeInput', () => {
    it('should block string input with blocked patterns (XSS)', () => {
      const input = '<script>alert("xss")</script>';
      const result = sandbox.sanitizeInput(input, {
        blockedPatterns: [/<script/i]
      });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('PATTERN_BLOCKED');
    });

    it('should validate allowed types', () => {
      const input = 123;
      // @ts-ignore
      const result = sandbox.sanitizeInput(input, {
        allowedTypes: ['string']
      });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('INVALID_INPUT_TYPE');
    });
  });

  describe('permissions', () => {
    it('should deny execution if permission missing', async () => {
      const context: SandboxContext = {
        timeout: 1000,
        memoryLimit: 1024,
        allowedModules: [],
        allowedGlobals: [],
        environment: 'production',
        userPermissions: ['read'], // Missing 'execute'
        resourceLimits: { maxCpuTime: 1000, maxHeapSize: 1024, maxStackSize: 1024 }
      };

      const result = await sandbox.execute('1+1', context);
      
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('PERMISSION_DENIED');
      }
    });
  });
});
