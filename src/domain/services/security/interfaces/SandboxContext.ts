export interface SandboxContext {
  timeout: number; // Execution timeout in milliseconds
  memoryLimit: number; // Memory limit in bytes
  allowedModules: string[]; // Allowed Node.js modules
  allowedGlobals: string[]; // Allowed global variables
  environment: 'development' | 'staging' | 'production';
  userPermissions: string[];
  resourceLimits: {
    maxCpuTime: number; // Maximum CPU time in milliseconds
    maxHeapSize: number; // Maximum heap size in bytes
    maxStackSize: number; // Maximum stack size in bytes
  };
}
