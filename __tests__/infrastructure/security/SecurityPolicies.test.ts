import { describe, it, expect } from 'vitest';
import { SecurityPolicies } from '../../../src/infrastructure/security/SecurityPolicies';

describe('SecurityPolicies', () => {
  describe('NO_EVAL', () => {
    it('should detect eval()', () => {
      const violation = SecurityPolicies.NO_EVAL.checkViolation('eval("1+1")', {} as any);
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('unsafe_code');
    });

    it('should detect Function()', () => {
      const violation = SecurityPolicies.NO_EVAL.checkViolation('new Function("return 1")', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should detect setTimeout()', () => {
      const violation = SecurityPolicies.NO_EVAL.checkViolation('setTimeout(() => {}, 1000)', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should detect setInterval()', () => {
      const violation = SecurityPolicies.NO_EVAL.checkViolation('setInterval(() => {}, 1000)', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should allow safe code', () => {
      const violation = SecurityPolicies.NO_EVAL.checkViolation('const a = 1;', {} as any);
      expect(violation).toBeNull();
    });
  });

  describe('NO_SENSITIVE_GLOBALS', () => {
    it('should detect process', () => {
      const violation = SecurityPolicies.NO_SENSITIVE_GLOBALS.checkViolation('process.exit(1)', {} as any);
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('unsafe_code');
    });

    it('should detect window', () => {
      const violation = SecurityPolicies.NO_SENSITIVE_GLOBALS.checkViolation('window.location', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should detect document', () => {
      const violation = SecurityPolicies.NO_SENSITIVE_GLOBALS.checkViolation('document.body', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should allow safe code', () => {
      const violation = SecurityPolicies.NO_SENSITIVE_GLOBALS.checkViolation('const a = 1;', {} as any);
      expect(violation).toBeNull();
    });
  });

  describe('NO_INFINITE_LOOPS', () => {
    it('should detect for(;;)', () => {
      const violation = SecurityPolicies.NO_INFINITE_LOOPS.checkViolation('for(;;)', {} as any);
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('resource_exhaustion');
    });

    it('should detect while(true)', () => {
      const violation = SecurityPolicies.NO_INFINITE_LOOPS.checkViolation('while(true)', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should allow safe loops', () => {
      const violation = SecurityPolicies.NO_INFINITE_LOOPS.checkViolation('for(let i=0; i<10; i++) {}', {} as any);
      expect(violation).toBeNull();
    });
  });

  describe('NO_MALICIOUS_PATTERNS', () => {
    it('should detect require("fs")', () => {
      const violation = SecurityPolicies.NO_MALICIOUS_PATTERNS.checkViolation('require("fs")', {} as any);
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('malicious_pattern');
    });

    it('should detect process.exit', () => {
      const violation = SecurityPolicies.NO_MALICIOUS_PATTERNS.checkViolation('process.exit()', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should allow safe code', () => {
      const violation = SecurityPolicies.NO_MALICIOUS_PATTERNS.checkViolation('const fs = "fs";', {} as any);
      expect(violation).toBeNull();
    });
  });

  describe('NO_BROWSER_XSS', () => {
    it('should detect <script>', () => {
      const violation = SecurityPolicies.NO_BROWSER_XSS.checkViolation('<script>alert(1)</script>', {} as any);
      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('xss');
    });

    it('should detect javascript:', () => {
      const violation = SecurityPolicies.NO_BROWSER_XSS.checkViolation('javascript:alert(1)', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should detect innerHTML', () => {
      const violation = SecurityPolicies.NO_BROWSER_XSS.checkViolation('el.innerHTML = "foo"', {} as any);
      expect(violation).not.toBeNull();
    });

    it('should allow safe strings', () => {
      const violation = SecurityPolicies.NO_BROWSER_XSS.checkViolation('const script = "safe text";', {} as any);
      expect(violation).toBeNull();
    });
  });
});
