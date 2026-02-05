import { ContractDefinitionSchema } from './definitions';
import { VALID_CONTRACT_CATEGORIES } from './ContractCategories';
import {
  VariantsSchema,
  PropsSchema,
  AccessibilitySchema,
  ValidationSchema,
  MetadataSchema
} from './parts/sections';
import { SchemaDefinitions } from './parts/definitions/SchemaDefinitions';

/**
 * Standard Contract Definition Schema
 * This is the canonical schema that all contract definitions must conform to
 */
export const STANDARD_CONTRACT_SCHEMA: ContractDefinitionSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://raw.githubusercontent.com/damarkuncoro/meta-architecture/main/src/schemas/contract-definition.json',
  title: 'Contract Definition',
  description: 'Schema for defining UI component contracts in the SR UI system',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-z][a-zA-Z0-9_-]*$',
      description: 'Unique contract name following kebab-case convention'
    },
    category: {
      type: 'string',
      enum: [...VALID_CONTRACT_CATEGORIES],
      description: 'Contract category defining its purpose and scope'
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Semantic version of the contract'
    },
    description: {
      type: 'string',
      maxLength: 500,
      description: 'Human-readable description of the contract'
    },
    variants: VariantsSchema,
    props: PropsSchema,
    accessibility: AccessibilitySchema,
    validation: ValidationSchema,
    metadata: MetadataSchema
  },
  required: ['name', 'category', 'variants', 'props'],
  additionalProperties: false,
  definitions: SchemaDefinitions
};
