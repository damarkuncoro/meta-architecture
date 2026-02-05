import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthChecker, HealthStatus, healthChecker } from '../../../src/infrastructure/health/HealthChecker';
import { InMemoryContractRepository } from '../../../src/infrastructure/repositories/InMemoryContractRepository';
import { LruCache } from '../../../src/infrastructure/caching/LruCache';
import { InMemoryDomainEventPublisher } from '../../../src/infrastructure/events/InMemoryDomainEventPublisher';

describe('HealthChecker', () => {
  let repository: InMemoryContractRepository;
  let cache: LruCache<string>;
  let eventPublisher: InMemoryDomainEventPublisher;
  let healthCheckerWithDeps: HealthChecker;

  beforeEach(async () => {
    repository = new InMemoryContractRepository();
    cache = new LruCache<string>({ maxSize: 10 });
    eventPublisher = new InMemoryDomainEventPublisher();

    healthCheckerWithDeps = new HealthChecker(repository, cache, eventPublisher);
  });

  describe('Basic Health Checks', () => {
    it('should perform health check with all components healthy', async () => {
      const health = await healthCheckerWithDeps.checkHealth();

      expect(health.status).toBe(HealthStatus.HEALTHY);
      expect(health.checks).toBeDefined();
      expect(health.summary.total).toBeGreaterThan(0);
      expect(health.summary.healthy).toBe(health.summary.total);
      expect(health.summary.unhealthy).toBe(0);
      expect(health.duration).toBeGreaterThan(0);
    });

    it('should include all expected health checks', async () => {
      const health = await healthCheckerWithDeps.checkHealth();

      const expectedChecks = ['database', 'cache', 'event-publisher', 'memory', 'application'];
      expectedChecks.forEach(checkName => {
        expect(health.checks[checkName]).toBeDefined();
        expect(health.checks[checkName].status).toBe(HealthStatus.HEALTHY);
      });
    });

    it('should handle missing dependencies gracefully', async () => {
      const minimalChecker = new HealthChecker();
      const health = await minimalChecker.checkHealth();

      // Should still have memory and application checks
      expect(health.checks['memory']).toBeDefined();
      expect(health.checks['application']).toBeDefined();
      expect(health.status).toBe(HealthStatus.HEALTHY);
    });
  });

  describe('Database Health Check', () => {
    it('should report healthy database when operations succeed', async () => {
      const health = await healthCheckerWithDeps.checkHealth();
      const dbCheck = health.checks['database'];

      expect(dbCheck.status).toBe(HealthStatus.HEALTHY);
      expect(dbCheck.details.contractsCount).toBeDefined();
      expect(dbCheck.details.operation).toBe('findAll');
    });

    it('should report unhealthy database when operations fail', async () => {
      vi.spyOn(repository, 'findAll').mockRejectedValue(new Error('Database connection failed'));

      const health = await healthCheckerWithDeps.checkHealth();
      const dbCheck = health.checks['database'];

      expect(dbCheck.status).toBe(HealthStatus.UNHEALTHY);
      expect(dbCheck.details.error).toBe('Database connection failed');
    });
  });

  describe('Cache Health Check', () => {
    it('should report healthy cache when operations succeed', async () => {
      const health = await healthCheckerWithDeps.checkHealth();
      const cacheCheck = health.checks['cache'];

      expect(cacheCheck.status).toBe(HealthStatus.HEALTHY);
      expect(cacheCheck.details.cacheHit).toBe(true);
      expect(cacheCheck.details.cacheHas).toBe(true);
      expect(cacheCheck.details.cacheStats).toBeDefined();
    });

    it('should report unhealthy cache when operations fail', async () => {
      vi.spyOn(cache, 'set').mockRejectedValue(new Error('Cache write failed'));

      const health = await healthCheckerWithDeps.checkHealth();
      const cacheCheck = health.checks['cache'];

      expect(cacheCheck.status).toBe(HealthStatus.UNHEALTHY);
      expect(cacheCheck.details.error).toBe('Cache write failed');
    });
  });

  describe('Memory Health Check', () => {
    it('should report memory usage statistics', async () => {
      const health = await healthCheckerWithDeps.checkHealth();
      const memoryCheck = health.checks['memory'];

      expect(memoryCheck.status).toBeDefined();
      expect(memoryCheck.details.heapTotal).toMatch(/MB$/);
      expect(memoryCheck.details.heapUsed).toMatch(/MB$/);
      expect(memoryCheck.details.usagePercent).toMatch(/%$/);
    });

    it('should report degraded status for high memory usage', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      (process.memoryUsage as any) = vi.fn().mockReturnValue({
        heapTotal: 100 * 1024 * 1024, // 100MB
        heapUsed: 85 * 1024 * 1024,  // 85MB (85% usage)
        external: 0,
        rss: 100 * 1024 * 1024,
        arrayBuffers: 0
      });

      const health = await healthCheckerWithDeps.checkHealth();
      const memoryCheck = health.checks['memory'];

      expect(memoryCheck.status).toBe(HealthStatus.DEGRADED);
      expect(memoryCheck.details.usagePercent).toBe('85%');

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('Application Health Check', () => {
    it('should report application runtime information', async () => {
      const health = await healthCheckerWithDeps.checkHealth();
      const appCheck = health.checks['application'];

      expect(appCheck.status).toBe(HealthStatus.HEALTHY);
      expect(appCheck.details.uptime).toMatch(/s$/);
      expect(appCheck.details.nodeVersion).toBeDefined();
      expect(appCheck.details.platform).toBeDefined();
      expect(appCheck.details.pid).toBeDefined();
    });
  });

  describe('Custom Health Checks', () => {
    it('should allow adding custom health checks', async () => {
      healthCheckerWithDeps.addCheck({
        name: 'custom-check',
        description: 'Custom health check',
        critical: false,
        timeout: 1000,
        check: async () => ({
          status: HealthStatus.HEALTHY,
          timestamp: new Date(),
          duration: 10,
          details: { custom: 'data' }
        })
      });

      const health = await healthCheckerWithDeps.checkHealth();
      expect(health.checks['custom-check']).toBeDefined();
      expect(health.checks['custom-check'].status).toBe(HealthStatus.HEALTHY);
    });

    it('should handle custom check failures', async () => {
      healthCheckerWithDeps.addCheck({
        name: 'failing-check',
        description: 'Check that fails',
        critical: true,
        timeout: 1000,
        check: async () => {
          throw new Error('Custom check failed');
        }
      });

      const health = await healthCheckerWithDeps.checkHealth();
      expect(health.checks['failing-check'].status).toBe(HealthStatus.UNHEALTHY);
      expect(health.status).toBe(HealthStatus.UNHEALTHY); // Critical check failed
    });

    it('should allow removing health checks', () => {
      healthCheckerWithDeps.addCheck({
        name: 'removable-check',
        description: 'Check to be removed',
        critical: false,
        timeout: 1000,
        check: async () => ({
          status: HealthStatus.HEALTHY,
          timestamp: new Date(),
          duration: 0,
          details: {}
        })
      });

      expect(healthCheckerWithDeps.getChecks().find(c => c.name === 'removable-check')).toBeDefined();

      healthCheckerWithDeps.removeCheck('removable-check');

      expect(healthCheckerWithDeps.getChecks().find(c => c.name === 'removable-check')).toBeUndefined();
    });
  });

  describe('Component-specific Health Checks', () => {
    it('should check individual components', async () => {
      const result = await healthCheckerWithDeps.checkComponent('database');

      expect(result).toBeDefined();
      expect(result!.status).toBe(HealthStatus.HEALTHY);
      expect(result!.details.contractsCount).toBeDefined();
    });

    it('should return null for non-existent component checks', async () => {
      const result = await healthCheckerWithDeps.checkComponent('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('Timeout Handling', () => {
    it('should handle check timeouts', async () => {
      healthCheckerWithDeps.addCheck({
        name: 'slow-check',
        description: 'Slow health check',
        critical: false,
        timeout: 50, // Very short timeout
        check: async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Take longer than timeout
          return {
            status: HealthStatus.HEALTHY,
            timestamp: new Date(),
            duration: 100,
            details: {}
          };
        }
      });

      const health = await healthCheckerWithDeps.checkHealth();
      const slowCheck = health.checks['slow-check'];

      expect(slowCheck.status).toBe(HealthStatus.UNHEALTHY);
      expect(slowCheck.details.error).toContain('timeout');
    });
  });

  describe('Overall System Health', () => {
    it('should report healthy when all checks pass', async () => {
      const health = await healthCheckerWithDeps.checkHealth();

      expect(health.status).toBe(HealthStatus.HEALTHY);
      expect(health.summary.unhealthy).toBe(0);
    });

    it('should report unhealthy when critical checks fail', async () => {
      vi.spyOn(repository, 'findAll').mockRejectedValue(new Error('Critical failure'));

      const health = await healthCheckerWithDeps.checkHealth();

      expect(health.status).toBe(HealthStatus.UNHEALTHY);
      expect(health.summary.unhealthy).toBeGreaterThan(0);
    });

    it('should report degraded when non-critical checks fail', async () => {
      vi.spyOn(cache, 'set').mockRejectedValue(new Error('Cache failure'));

      const health = await healthCheckerWithDeps.checkHealth();

      expect(health.status).toBe(HealthStatus.DEGRADED);
      expect(health.summary.degraded).toBeGreaterThan(0);
    });
  });

  describe('Global Health Checker', () => {
    it('should provide a global health checker instance', () => {
      expect(healthChecker).toBeDefined();
      expect(healthChecker).toBeInstanceOf(HealthChecker);
    });
  });
});