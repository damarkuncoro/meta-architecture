import { describe, it, expect } from 'vitest';
import { SandboxFactory } from '../../../src/infrastructure/security/SandboxFactory';

describe('SandboxFactory', () => {
  describe('createDevelopmentSandbox', () => {
    it('should create sandbox with relaxed policies', async () => {
      const sandbox = SandboxFactory.createDevelopmentSandbox();
      
      // Debug: Print policies
      // console.log('Policies:', (sandbox as any).policies.map((p: any) => p.name));

      // Should allow eval (no-eval policy removed)
      const evalResult = await sandbox.validateCode('eval("1+1")');
      
      // If this fails, it means SafeSandbox has hardcoded checks that ignore policy removal
      // We expect it to be allowed in development sandbox
      const evalViolations = evalResult.isSuccess ? evalResult.value : [];
      // console.log('Violations:', evalViolations);

      const hasEvalViolation = evalViolations.some((v: any) => v.description.includes('Eval'));
      
      expect(hasEvalViolation).toBe(false);
    });

    it('should allow malicious patterns (no-malicious-patterns policy removed)', async () => {
      const sandbox = SandboxFactory.createDevelopmentSandbox();
      
      // Should allow process.exit (no-malicious-patterns policy removed)
      const result = await sandbox.validateCode('process.exit(1)');
      
      const violations = result.isSuccess ? result.value : [];
      const hasViolation = violations.some((v: any) => v.type === 'malicious_pattern');
      
      expect(hasViolation).toBe(false);
    });
  });

  describe('createProductionSandbox', () => {
    it('should create sandbox with strict policies', async () => {
      const sandbox = SandboxFactory.createProductionSandbox();
      
      // Should block eval
      const evalResult = await sandbox.validateCode('eval("1+1")');
      
      const evalViolations = evalResult.isSuccess ? evalResult.value : [];
      expect(evalViolations.some((v: any) => v.description.includes('dangerous function'))).toBe(true);
    });

    it('should enforce production specific policies', async () => {
      const sandbox = SandboxFactory.createProductionSandbox();
      
      // Should block console.log in production
      const result = await sandbox.validateCode('console.log("debug")');
      
      const violations = result.isSuccess ? result.value : [];
      const hasViolation = violations.some((v: any) => v.description.includes('Debug code detected'));
      
      expect(hasViolation).toBe(true);
    });
  });

  describe('createMinimalSandbox', () => {
    it('should create sandbox with minimal policies', async () => {
      const sandbox = SandboxFactory.createMinimalSandbox();
      
      // Should allow infinite loops (no-infinite-loops policy removed)
      const result = await sandbox.validateCode('while(true) {}');
      
      const violations = result.isSuccess ? result.value : [];
      const hasViolation = violations.some((v: any) => v.type === 'resource_exhaustion');
      
      expect(hasViolation).toBe(false);
    });
  });
});
