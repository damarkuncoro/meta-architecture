import { ContractEntity } from '../../../domain/entities/ContractEntity';

export interface ValidationContext {
  existingContracts: ContractEntity[];
  environment: 'development' | 'staging' | 'production';
  userPermissions: string[];
  registryStats: {
    totalContracts: number;
    activeContracts: number;
  };
}
