import { ContractEntity } from '../../domain/entities/ContractEntity';
import { SecurityValidationResult, SecurityVulnerability } from './interfaces';

/**
 * Security Validator
 * Dedicated validator for contract security analysis
 */
export class SecurityValidator {
  async validate(contract: ContractEntity | any): Promise<SecurityValidationResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: string[] = [];

    // Check for contract definition
    if (typeof contract === 'object' && contract !== null) {
      // Check for potentially dangerous patterns
      const contractStr = JSON.stringify(contract);

      // Check for script injection patterns
      if (contractStr.includes('<script') || contractStr.includes('javascript:')) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          description: 'Contract contains potential XSS vectors',
          location: 'contract definition',
          recommendation: 'Remove script tags and javascript: URLs from contract definitions'
        });
      }

      // Check for insecure defaults
      if (contract.defaultValue && typeof contract.defaultValue === 'string') {
        if (contract.defaultValue.includes('admin') || contract.defaultValue.includes('root')) {
          vulnerabilities.push({
            type: 'insecure-defaults',
            severity: 'medium',
            description: 'Contract has potentially insecure default values',
            location: 'default values',
            recommendation: 'Review and secure default values'
          });
        }
      }

      // Check for data leak patterns
      if (contractStr.includes('password') && !contractStr.includes('encrypted')) {
        recommendations.push('Consider encrypting password fields');
      }
    }

    const riskLevel = vulnerabilities.length === 0 ? 'low' :
                      vulnerabilities.some(v => v.severity === 'critical') ? 'critical' :
                      vulnerabilities.some(v => v.severity === 'high') ? 'high' : 'medium';

    return {
      isSecure: vulnerabilities.length === 0,
      vulnerabilities,
      recommendations,
      riskLevel
    };
  }
}
