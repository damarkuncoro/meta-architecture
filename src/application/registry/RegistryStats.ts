/**
 * Statistics for the Contract Registry
 */
export interface RegistryStats {
  totalContracts: number;
  categories: Record<string, number>;
  activeContracts: number;
  memoryUsage: number;
}
