import { IContractRepository } from '../../domain/repositories/IContractRepository';
import { ICache } from '../../domain/services/caching/interfaces/ICache';
import { IDomainEventPublisher } from '../../domain/shared/events';

/**
 * Health status enumeration
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  duration: number;
  details: Record<string, any>;
}

/**
 * Individual health check
 */
export interface HealthCheck {
  name: string;
  description: string;
  check: () => Promise<HealthCheckResult>;
  critical: boolean;
  timeout: number;
}

/**
 * Overall health status
 */
export interface SystemHealth {
  status: HealthStatus;
  timestamp: Date;
  duration: number;
  checks: Record<string, HealthCheckResult>;
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

/**
 * Health Checker - System health monitoring
 * Provides comprehensive health checks for all system components
 */
export class HealthChecker {
  private checks: HealthCheck[] = [];

  constructor(
    private readonly repository?: IContractRepository,
    private readonly cache?: ICache,
    private readonly eventPublisher?: IDomainEventPublisher
  ) {
    this.initializeChecks();
  }

  /**
   * Add a custom health check
   */
  addCheck(check: HealthCheck): void {
    this.checks.push(check);
  }

  /**
   * Remove a health check by name
   */
  removeCheck(name: string): void {
    this.checks = this.checks.filter(check => check.name !== name);
  }

  /**
   * Run all health checks
   */
  async checkHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    const results: Record<string, HealthCheckResult> = {};
    let healthy = 0;
    let unhealthy = 0;
    let degraded = 0;

    // Run all checks in parallel
    const checkPromises = this.checks.map(async (check) => {
      try {
        const result = await this.runCheckWithTimeout(check);
        results[check.name] = result;

        switch (result.status) {
          case HealthStatus.HEALTHY:
            healthy++;
            break;
          case HealthStatus.UNHEALTHY:
            if (check.critical) {
              unhealthy++;
            } else {
              degraded++;
            }
            break;
          case HealthStatus.DEGRADED:
            degraded++;
            break;
        }
      } catch (error) {
        // If check fails completely, treat as unhealthy (could be either critical or not)
        results[check.name] = {
          status: HealthStatus.UNHEALTHY,
          timestamp: new Date(),
          duration: 0,
          details: { error: error instanceof Error ? error.message : String(error) }
        };
        if (check.critical) {
          unhealthy++;
        } else {
          degraded++;
        }
      }
    });

    await Promise.all(checkPromises);

    const totalDuration = Date.now() - startTime;

    // Determine overall system health
    let overallStatus = HealthStatus.HEALTHY;
    if (unhealthy > 0) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (degraded > 0) {
      overallStatus = HealthStatus.DEGRADED;
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      duration: totalDuration,
      checks: results,
      summary: {
        total: this.checks.length,
        healthy,
        unhealthy,
        degraded
      }
    };
  }

  /**
   * Run a specific health check
   */
  async checkComponent(name: string): Promise<HealthCheckResult | null> {
    const check = this.checks.find(c => c.name === name);
    if (!check) return null;

    return this.runCheckWithTimeout(check);
  }

  /**
   * Get all registered health checks
   */
  getChecks(): readonly HealthCheck[] {
    return [...this.checks];
  }

  private async runCheckWithTimeout(check: HealthCheck): Promise<HealthCheckResult> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Health check timeout after ${check.timeout}ms`)), check.timeout);
    });

    try {
      const result = await Promise.race([check.check(), timeoutPromise]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  private initializeChecks(): void {
    // Database/Repository Health Check
    if (this.repository) {
      this.addCheck({
        name: 'database',
        description: 'Contract repository connectivity and basic operations',
        critical: true,
        timeout: 5000,
        check: async (): Promise<HealthCheckResult> => {
          const startTime = Date.now();

          try {
            // Test basic repository operations
            if (!this.repository) {
              throw new Error('Repository not available');
            }

            const count = (await this.repository.findAll()).length;

            return {
              status: HealthStatus.HEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                contractsCount: count,
                operation: 'findAll'
              }
            };
          } catch (error) {
            return {
              status: HealthStatus.UNHEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                error: error instanceof Error ? error.message : String(error),
                operation: 'findAll'
              }
            };
          }
        }
      });
    }

    // Cache Health Check
    if (this.cache) {
      this.addCheck({
        name: 'cache',
        description: 'Cache service availability and performance',
        critical: false,
        timeout: 2000,
        check: async (): Promise<HealthCheckResult> => {
          const startTime = Date.now();

          try {
            if (!this.cache) {
              throw new Error('Cache not available');
            }

            const testKey = `health-check-${Date.now()}`;
            const testValue = { timestamp: Date.now(), status: 'ok' };

            // Test basic cache operations
            await this.cache.set(testKey, testValue, 10); // 10ms TTL
            const retrieved = await this.cache.get(testKey);
            const hasKey = await this.cache.has(testKey);

            // Clean up
            await this.cache.delete(testKey);

            const stats = await this.cache.getStats();

            const isHealthy = retrieved !== null && hasKey;

            return {
              status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                cacheHit: retrieved !== null,
                cacheHas: hasKey,
                cacheStats: stats,
                operation: 'set-get-delete'
              }
            };
          } catch (error) {
            return {
              status: HealthStatus.UNHEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                error: error instanceof Error ? error.message : String(error),
                operation: 'cache-operations'
              }
            };
          }
        }
      });
    }

    // Event Publisher Health Check
    if (this.eventPublisher) {
      this.addCheck({
        name: 'event-publisher',
        description: 'Domain event publishing system',
        critical: false,
        timeout: 1000,
        check: async (): Promise<HealthCheckResult> => {
          const startTime = Date.now();

          try {
            // Test event publishing (this will be handled by the publisher)
            // In a real implementation, you might check queue length, connection status, etc.
            const isHealthy = this.eventPublisher !== undefined;

            return {
              status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                publisherAvailable: isHealthy,
                operation: 'publisher-check'
              }
            };
          } catch (error) {
            return {
              status: HealthStatus.UNHEALTHY,
              timestamp: new Date(),
              duration: Date.now() - startTime,
              details: {
                error: error instanceof Error ? error.message : String(error),
                operation: 'publisher-check'
              }
            };
          }
        }
      });
    }

    // Memory Health Check
    this.addCheck({
      name: 'memory',
      description: 'System memory usage monitoring',
      critical: false,
      timeout: 500,
      check: async (): Promise<HealthCheckResult> => {
        const startTime = Date.now();

        try {
          // Get memory usage (Node.js specific)
          const memUsage = process.memoryUsage();
          const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
          const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
          const usagePercent = Math.round((usedMB / totalMB) * 100);

          // Consider unhealthy if memory usage is critically high
          let status = HealthStatus.HEALTHY;
          if (usagePercent > 90) {
            status = HealthStatus.UNHEALTHY;
          } else if (usagePercent > 80) {
            status = HealthStatus.DEGRADED;
          }

          return {
            status,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            details: {
              heapTotal: `${totalMB}MB`,
              heapUsed: `${usedMB}MB`,
              usagePercent: `${usagePercent}%`,
              external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
              rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
            }
          };
        } catch (error) {
          return {
            status: HealthStatus.UNHEALTHY,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            details: {
              error: error instanceof Error ? error.message : String(error),
              operation: 'memory-check'
            }
          };
        }
      }
    });

    // Application Health Check
    this.addCheck({
      name: 'application',
      description: 'Application runtime health',
      critical: true,
      timeout: 1000,
      check: async (): Promise<HealthCheckResult> => {
        const startTime = Date.now();

        try {
          const uptime = process.uptime();
          const nodeVersion = process.version;
          const platform = process.platform;

          return {
            status: HealthStatus.HEALTHY,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            details: {
              uptime: `${Math.round(uptime)}s`,
              nodeVersion,
              platform,
              pid: process.pid,
              operation: 'runtime-check'
            }
          };
        } catch (error) {
          return {
            status: HealthStatus.UNHEALTHY,
            timestamp: new Date(),
            duration: Date.now() - startTime,
            details: {
              error: error instanceof Error ? error.message : String(error),
              operation: 'runtime-check'
            }
          };
        }
      }
    });
  }
}

/**
 * Global health checker instance
 */
export const healthChecker = new HealthChecker();