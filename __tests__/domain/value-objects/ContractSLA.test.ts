import { describe, it, expect } from 'vitest';
import { ContractSLA } from '../../../src/domain/value-objects/ContractSLA';

describe('ContractSLA', () => {
  it('should create empty SLA', () => {
    const sla = ContractSLA.create();
    expect(sla.all).toEqual({});
  });

  it('should create SLA with properties', () => {
    const props = {
      latency: '100ms',
      throughput: '1000req/s',
      availability: '99.9%'
    };
    const sla = ContractSLA.create(props);
    expect(sla.latency).toBe('100ms');
    expect(sla.throughput).toBe('1000req/s');
    expect(sla.availability).toBe('99.9%');
  });

  it('should handle custom properties', () => {
    const sla = ContractSLA.create({ custom: 'value' });
    expect(sla.all['custom']).toBe('value');
  });

  it('should implement equality', () => {
    const sla1 = ContractSLA.create({ latency: '100ms', throughput: '100req/s' });
    const sla2 = ContractSLA.create({ throughput: '100req/s', latency: '100ms' }); // Order shouldn't matter
    
    expect(sla1.equals(sla2)).toBe(true);
  });
});
