import { ValueObject } from '../shared/ValueObject';

export interface ConfigurationProps {
  [key: string]: any;
}

export class ContractConfiguration extends ValueObject {
  constructor(private readonly props: ConfigurationProps) {
    super();
  }

  static create(props: ConfigurationProps): ContractConfiguration {
    return new ContractConfiguration(props);
  }

  protected getEqualityProperties(): any[] {
    // Using JSON.stringify for deep comparison of configuration object
    return [JSON.stringify(this.props)];
  }

  get value(): ConfigurationProps {
    return { ...this.props };
  }
  
  getValue(key: string): any {
    return this.props[key];
  }
}
