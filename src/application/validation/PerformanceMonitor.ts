import { PerformanceMetrics } from './interfaces';

/**
 * Enhanced performance monitoring utility with granular tracking
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private executionTimes: number[] = [];
  private errorCount: number = 0;
  private totalExecutions: number = 0;
  private ruleExecutionTimes: Map<string, number[]> = new Map();
  private throughputHistory: number[] = [];
  private lastGcCheck: number = Date.now();
  private gcPressure: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  end(): void {
    if (this.startTime > 0) {
      const duration = Date.now() - this.startTime;
      this.executionTimes.push(duration);
      this.totalExecutions++;
      this.updateThroughput();
      this.startTime = 0;
    }
  }

  /**
   * Record execution time for a specific rule
   */
  recordRuleExecution(ruleName: string, executionTime: number, success: boolean): void {
    if (!this.ruleExecutionTimes.has(ruleName)) {
      this.ruleExecutionTimes.set(ruleName, []);
    }
    this.ruleExecutionTimes.get(ruleName)!.push(executionTime);

    if (!success) {
      this.errorCount++;
    }
  }

  getAverageExecutionTime(): number {
    if (this.executionTimes.length === 0) return 0;
    return this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
  }

  getErrorRate(): number {
    return this.totalExecutions > 0 ? this.errorCount / this.totalExecutions : 0;
  }

  /**
   * Calculate percentile from execution times
   */
  private calculatePercentile(times: number[], percentile: number): number {
    if (times.length === 0) return 0;
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get 95th percentile execution time
   */
  getPercentile95(): number {
    return this.calculatePercentile(this.executionTimes, 95);
  }

  /**
   * Get 99th percentile execution time
   */
  getPercentile99(): number {
    return this.calculatePercentile(this.executionTimes, 99);
  }

  /**
   * Get current throughput (validations per second)
   */
  getThroughput(): number {
    if (this.throughputHistory.length === 0) return 0;
    return this.throughputHistory[this.throughputHistory.length - 1];
  }

  /**
   * Update throughput calculation
   */
  private updateThroughput(): void {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const recentExecutions = this.executionTimes.filter(
      time => (now - time) < windowMs
    ).length;

    const throughput = recentExecutions / (windowMs / 1000); // per second
    this.throughputHistory.push(throughput);

    // Keep only last 10 measurements
    if (this.throughputHistory.length > 10) {
      this.throughputHistory.shift();
    }
  }

  getMemoryUsage(): number {
    // Enhanced memory estimation
    const baseMemory = this.executionTimes.length * 1024; // ~1KB per execution record
    const ruleMemory = Array.from(this.ruleExecutionTimes.values())
      .reduce((sum, times) => sum + times.length * 256, 0); // ~256B per rule execution

    return baseMemory + ruleMemory;
  }

  /**
   * Estimate CPU usage based on execution patterns
   */
  getCpuUsage(): number {
    if (this.executionTimes.length === 0) return 0;

    const avgTime = this.getAverageExecutionTime();
    const p95 = this.getPercentile95();

    // Rough CPU usage estimate based on execution time distribution
    // Higher p95 relative to average suggests CPU contention
    const cpuPressure = Math.min(1, (p95 - avgTime) / avgTime);
    return Math.round(cpuPressure * 100) / 100;
  }

  /**
   * Estimate garbage collection pressure
   */
  getGcPressure(): number {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastGcCheck;

    // Simulate GC pressure based on memory growth over time
    const memoryGrowth = this.getMemoryUsage() / Math.max(1, timeSinceLastCheck);
    this.gcPressure = Math.min(1, this.gcPressure + (memoryGrowth * 0.001));

    // Decay GC pressure over time
    this.gcPressure *= 0.99;

    this.lastGcCheck = now;
    return Math.round(this.gcPressure * 100) / 100;
  }

  recordError(): void {
    this.errorCount++;
  }

  /**
   * Get detailed breakdown of rule performance
   */
  getRuleBreakdown(): Array<{ ruleName: string; executionTime: number; success: boolean }> {
    const breakdown: Array<{ ruleName: string; executionTime: number; success: boolean }> = [];

    for (const [ruleName, times] of this.ruleExecutionTimes.entries()) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      // Note: We don't have success/failure per rule in current implementation
      // This would need to be enhanced in the calling code
      breakdown.push({
        ruleName,
        executionTime: Math.round(avgTime),
        success: true // Placeholder - would need actual success tracking
      });
    }

    return breakdown;
  }

  calculateMetrics(startTime: number, rulesExecuted: number, ruleBreakdown?: Array<{ ruleName: string; executionTime: number; success: boolean }>): PerformanceMetrics {
    const validationTime = Date.now() - startTime;
    const memoryUsage = this.getMemoryUsage();

    let complexity: 'low' | 'medium' | 'high' | 'critical';
    if (validationTime < 100) complexity = 'low';
    else if (validationTime < 500) complexity = 'medium';
    else if (validationTime < 2000) complexity = 'high';
    else complexity = 'critical';

    return {
      validationTime,
      memoryUsage,
      rulesExecuted,
      complexity,
      throughput: this.getThroughput(),
      percentile95: this.getPercentile95(),
      percentile99: this.getPercentile99(),
      ruleBreakdown: ruleBreakdown || this.getRuleBreakdown(),
      gcPressure: this.getGcPressure(),
      cpuUsage: this.getCpuUsage()
    };
  }
}
