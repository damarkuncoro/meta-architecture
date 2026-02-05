import { SecurityViolation } from './SecurityViolation';

export interface SandboxResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  securityViolations: SecurityViolation[];
}
