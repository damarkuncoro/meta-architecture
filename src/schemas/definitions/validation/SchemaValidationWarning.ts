export interface SchemaValidationWarning {
  path: string;
  message: string;
  code: string;
  value?: any;
}
