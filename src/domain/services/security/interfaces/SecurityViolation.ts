export interface SecurityViolation {
  type: 'unsafe_code' | 'resource_exhaustion' | 'permission_denied' | 'malicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  recommendation: string;
}
