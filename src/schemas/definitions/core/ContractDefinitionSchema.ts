import { ContractProperties } from '../sections';

export interface ContractDefinitionSchema {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: 'object';
  properties: ContractProperties;
  required: string[];
  additionalProperties: boolean;
  definitions?: Record<string, any>;
}
