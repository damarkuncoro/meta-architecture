import { AccessibilityProperty } from '../../definitions/sections/AccessibilityProperty';

export const AccessibilitySchema: AccessibilityProperty = {
  type: 'object',
  properties: {
    supported: {
      type: 'boolean'
    },
    roles: {
      type: 'array',
      items: { type: 'string' }
    },
    keyboardActions: {
      type: 'array',
      items: { type: 'string' }
    },
    ariaAttributes: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  additionalProperties: true,
  description: 'Accessibility configuration for the contract'
};
