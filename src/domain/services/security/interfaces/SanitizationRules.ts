export interface SanitizationRules {
  allowedTypes?: string[];
  maxDepth?: number;
  maxLength?: number;
  allowedPatterns?: RegExp[];
  blockedPatterns?: RegExp[];
  customValidators?: Array<(value: any) => boolean>;
}
