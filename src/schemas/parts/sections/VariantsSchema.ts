import { VariantsProperty } from '../../definitions/sections/VariantsProperty';

export const VariantsSchema: VariantsProperty = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-z][a-zA-Z0-9_-]*$'
      },
      type: {
        type: 'string',
        enum: ['size', 'intent', 'tone', 'emphasis', 'custom']
      },
      values: {
        type: 'array',
        items: {},
        minItems: 1
      },
      defaultValue: {
        description: 'Default value for this variant'
      },
      description: {
        type: 'string',
        maxLength: 200
      }
    },
    required: ['name', 'type', 'values']
  },
  minItems: 1,
  description: 'Array of variant definitions for the contract'
};
