import { SecurityVulnerability } from './SecurityVulnerability';

export interface SecurityValidationResult {
  isSecure: boolean;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
