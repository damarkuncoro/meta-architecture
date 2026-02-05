export interface StringProperty {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  description?: string;
  enum?: string[];
}
