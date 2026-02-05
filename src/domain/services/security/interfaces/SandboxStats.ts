export interface SandboxStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  securityViolations: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  timeouts: number;
  resourceExhaustions: number;
}
