export interface PerformanceMetrics {
  validationTime: number;
  memoryUsage: number;
  rulesExecuted: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  // Enhanced metrics
  throughput?: number; // validations per second
  percentile95?: number; // 95th percentile response time
  percentile99?: number; // 99th percentile response time
  ruleBreakdown?: Array<{
    ruleName: string;
    executionTime: number;
    success: boolean;
  }>;
  gcPressure?: number; // garbage collection pressure indicator
  cpuUsage?: number; // rough CPU usage estimate
}
