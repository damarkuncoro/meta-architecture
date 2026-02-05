import { StringProperty } from '../types';
import { EnumProperty } from '../types';
import { ArrayProperty } from '../types';
import { AnyProperty } from '../types';

export interface VariantProperties {
  name: StringProperty;
  type: EnumProperty;
  values: ArrayProperty;
  defaultValue?: AnyProperty;
  description?: StringProperty;
}
