import { ValidationProperty } from '../../definitions/sections/ValidationProperty';

export const ValidationSchema: ValidationProperty = {
  type: 'object',
  properties: {
    rules: {
      type: 'array',
      items: { type: 'string' }
    },
    schema: {
      type: 'object',
      additionalProperties: true
    },
    customValidator: {
      type: 'string',
      description: 'Custom validation logic (JavaScript function body) that returns boolean or error message'
    }
  },
  additionalProperties: true,
  description: 'Validation rules and schema for the contract'
};
