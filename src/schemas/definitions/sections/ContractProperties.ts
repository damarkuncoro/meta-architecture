import { StringProperty } from '../types';
import { EnumProperty } from '../types';
import { VariantsProperty } from './VariantsProperty';
import { PropsProperty } from './PropsProperty';
import { AccessibilityProperty } from './AccessibilityProperty';
import { ValidationProperty } from './ValidationProperty';
import { MetadataProperty } from './MetadataProperty';

export interface ContractProperties {
  name: StringProperty;
  category: EnumProperty;
  version?: StringProperty;
  description?: StringProperty;
  variants?: VariantsProperty;
  props?: PropsProperty;
  accessibility?: AccessibilityProperty;
  validation?: ValidationProperty;
  metadata?: MetadataProperty;
}
