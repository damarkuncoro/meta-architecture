import { PropProperties } from './PropProperties';

export interface PropsProperty {
  type: 'array';
  items: {
    type: 'object';
    properties: PropProperties;
    required: string[];
  };
  minItems?: number;
  description?: string;
}
