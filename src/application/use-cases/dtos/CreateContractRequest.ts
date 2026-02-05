import { ContractCategory } from '../../../domain/value-objects/ContractCategory';

/**
 * Input for creating a contract
 */
export interface CreateContractRequest {
  name: string;
  category: ContractCategory;
  description?: string;
  variants?: Array<{
    name: string;
    type: 'size' | 'intent' | 'tone' | 'emphasis' | 'custom';
    values: any[];
    defaultValue?: any;
    description?: string;
  }>;
  props?: Array<{
    name: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    description?: string;
    validation?: Record<string, any>;
  }>;
  accessibility?: {
    supported?: boolean;
    roles?: string[];
    keyboardActions?: string[];
  };
  validation?: Array<{
    type: 'required' | 'range' | 'pattern' | 'custom';
    target: string;
    params?: any;
  }>;
  metadata?: Record<string, any>;
  context?: {
    userId?: string;
    permissions?: string[];
    roles?: string[];
  };
}
