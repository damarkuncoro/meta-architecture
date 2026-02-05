import { AccessibilityProperties } from './AccessibilityProperties';

export interface AccessibilityProperty {
  type: 'object';
  properties: AccessibilityProperties;
  additionalProperties: boolean;
  description?: string;
}
