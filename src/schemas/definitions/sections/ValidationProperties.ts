import { ArrayProperty, StringProperty } from '../types';
import { ObjectProperty } from '../types';

export interface ValidationProperties {
  rules: ArrayProperty;
  schema: ObjectProperty;
  customValidator?: StringProperty;
}
