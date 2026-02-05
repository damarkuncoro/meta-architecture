import { PropsProperty } from '../../definitions/sections/PropsProperty';

export const PropsSchema: PropsProperty = {
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
        enum: ['string', 'number', 'boolean', 'array', 'object', 'function']
      },
      required: {
        type: 'boolean'
      },
      defaultValue: {
        description: 'Default value for this prop'
      },
      description: {
        type: 'string',
        maxLength: 200
      },
      validation: {
        type: 'object',
        additionalProperties: true
      }
    },
    required: ['name', 'type', 'required']
  },
  minItems: 1,
  description: 'Array of prop definitions for the contract'
};
