import { ValueObject } from '../shared/ValueObject';

export interface SLAProps {
  latency?: string;
  throughput?: string;
  availability?: string;
  [key: string]: string | undefined;
}

/**
 * Contract Service Level Agreement (SLA)
 * Defines non-functional requirements for the contract
 */
export class ContractSLA extends ValueObject {
  constructor(private readonly props: SLAProps) {
    super();
  }

  static create(props?: SLAProps): ContractSLA {
    return new ContractSLA(props || {});
  }

  get latency(): string | undefined { return this.props.latency; }
  get throughput(): string | undefined { return this.props.throughput; }
  get availability(): string | undefined { return this.props.availability; }
  
  get all(): SLAProps { return { ...this.props }; }

  protected getEqualityProperties(): any[] {
    // Sort keys to ensure deterministic stringification
    const sortedKeys = Object.keys(this.props).sort();
    const sortedProps = sortedKeys.reduce((acc, key) => {
      acc[key] = this.props[key];
      return acc;
    }, {} as SLAProps);
    
    return [JSON.stringify(sortedProps)];
  }
}
