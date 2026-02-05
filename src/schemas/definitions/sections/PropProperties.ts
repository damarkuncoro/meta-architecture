import { StringProperty } from '../types';
import { BooleanProperty } from '../types';
import { AnyProperty } from '../types';
import { ObjectProperty } from '../types';

export interface PropProperties {
  name: StringProperty;
  type: StringProperty;
  required: BooleanProperty;
  defaultValue?: AnyProperty;
  description?: StringProperty;
  validation?: ObjectProperty;
}
