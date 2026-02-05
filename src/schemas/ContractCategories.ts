/**
 * Valid contract categories
 * Defines the allowed categories for contracts in the schema
 * 
 * @guide How to add a new category:
 * 1. Add the new category string to the array below.
 * 2. That's it! The Domain Layer and Validation Schema will automatically support it.
 * 
 * (Optional) If you want static access in Domain (e.g. ContractCategory.NEW_CAT),
 * update src/domain/value-objects/ContractCategory.ts
 */
export const VALID_CONTRACT_CATEGORIES = [
  'ui.component',
  'ui.layout',
  'workflow',
  'service'
] as const;

export type ContractCategoryType = typeof VALID_CONTRACT_CATEGORIES[number];
