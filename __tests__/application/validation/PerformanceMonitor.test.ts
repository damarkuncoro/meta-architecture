import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor } from '../../../src/application/validation/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track execution time', () => {
    monitor.start();
    vi.advanceTimersByTime(100);
    monitor.end();

    expect(monitor.getAverageExecutionTime()).toBe(100);
  });

  it('should calculate average execution time', () => {
    monitor.start();
    vi.advanceTimersByTime(100);
    monitor.end();

    monitor.start();
    vi.advanceTimersByTime(200);
    monitor.end();

    expect(monitor.getAverageExecutionTime()).toBe(150);
  });

  it('should handle zero executions for average time', () => {
    expect(monitor.getAverageExecutionTime()).toBe(0);
  });

  it('should track error rate', () => {
    // 1 success
    monitor.start();
    monitor.end();

    // 1 error
    monitor.start();
    monitor.recordError();
    monitor.end();

    // 1 success
    monitor.start();
    monitor.end();

    // Total 3 executions, 1 error
    expect(monitor.getErrorRate()).toBeCloseTo(0.33, 2);
  });

  it('should handle zero executions for error rate', () => {
    expect(monitor.getErrorRate()).toBe(0);
  });

  it('should estimate memory usage', () => {
    monitor.start();
    monitor.end();
    monitor.start();
    monitor.end();

    // 2 executions * 1024 bytes
    expect(monitor.getMemoryUsage()).toBe(2048);
  });
});
