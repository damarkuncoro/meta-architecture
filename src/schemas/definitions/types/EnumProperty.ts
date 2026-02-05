import { StringProperty } from './StringProperty';

export interface EnumProperty extends StringProperty {
  enum: string[];
}
