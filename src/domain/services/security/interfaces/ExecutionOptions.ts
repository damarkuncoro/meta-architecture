export interface ExecutionOptions {
  timeout?: number;
  context?: Record<string, any>;
  allowedFunctions?: string[];
  restrictedPatterns?: RegExp[];
}
