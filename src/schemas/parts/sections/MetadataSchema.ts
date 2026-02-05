import { MetadataProperty } from '../../definitions/sections/MetadataProperty';

export const MetadataSchema: MetadataProperty = {
  type: 'object',
  additionalProperties: true,
  description: 'Additional metadata for the contract'
};
