import { ContractEntity } from '../../../domain/entities/ContractEntity';

/**
 * Output for contract creation
 */
export interface CreateContractResponse {
  contract: ContractEntity;
  success: boolean;
  message: string;
}
