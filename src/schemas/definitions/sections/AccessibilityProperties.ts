import { BooleanProperty } from '../types';
import { ArrayProperty } from '../types';

export interface AccessibilityProperties {
  supported: BooleanProperty;
  roles: ArrayProperty;
  keyboardActions: ArrayProperty;
  ariaAttributes?: ArrayProperty;
}
