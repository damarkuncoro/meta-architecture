export interface SchemaValidationError {
  path: string;
  message: string;
  code: string;
  value?: any;
}
