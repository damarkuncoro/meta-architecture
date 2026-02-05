import { AnyProperty } from './AnyProperty';

export interface ArrayProperty {
  type: 'array';
  items: AnyProperty;
  minItems?: number;
  description?: string;
}
