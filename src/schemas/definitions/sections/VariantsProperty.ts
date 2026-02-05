import { VariantProperties } from './VariantProperties';

export interface VariantsProperty {
  type: 'array';
  items: {
    type: 'object';
    properties: VariantProperties;
    required: string[];
  };
  minItems?: number;
  description?: string;
}
