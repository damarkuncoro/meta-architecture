export interface ValidationMetadata {
  validatorVersion: string;
  validationTimestamp: Date;
  contractVersion: string;
  rulesVersion: string;
  environment: 'development' | 'staging' | 'production';
}
