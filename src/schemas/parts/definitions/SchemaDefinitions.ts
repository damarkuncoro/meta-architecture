export const SchemaDefinitions = {
  VariantType: {
    type: 'string',
    enum: ['size', 'intent', 'tone', 'emphasis', 'custom']
  },
  PropType: {
    type: 'string',
    enum: ['string', 'number', 'boolean', 'array', 'object', 'function']
  }
};
