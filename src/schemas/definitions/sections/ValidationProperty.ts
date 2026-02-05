import { ValidationProperties } from './ValidationProperties';

export interface ValidationProperty {
  type: 'object';
  properties: ValidationProperties;
  additionalProperties: boolean;
  description?: string;
}
