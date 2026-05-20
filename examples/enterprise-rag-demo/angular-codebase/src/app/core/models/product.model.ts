/**
 * Product Model
 * Represents a master product record with common attributes
 */
export interface Product {
  id: string;
  title: string;
  brand: string;
  category: Category;
  description: string;
  shortDescription?: string;
  keywords: string[];
  skus: Sku[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  metadata?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  path: string[];
  parentId?: string;
  attributes: CategoryAttribute[];
  validationRules: string[];
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  validation?: AttributeValidation;
}

export interface AttributeValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export type ProductStatus = 
  | 'DRAFT'
  | 'PENDING_VALIDATION'
  | 'VALIDATION_FAILED'
  | 'VALIDATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'
  | 'PUBLISHED'
  | 'SUSPENDED'
  | 'ARCHIVED';

export interface ProductListItem {
  id: string;
  title: string;
  brand: string;
  categoryName: string;
  status: ProductStatus;
  skuCount: number;
  mainImageUrl?: string;
  updatedAt: Date;
}

export interface ProductFilters {
  search?: string;
  status?: ProductStatus[];
  categories?: string[];
  brands?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ProductValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  ruleId: string;
  field: string;
  message: string;
  skuId?: string;
}

export interface ValidationWarning {
  ruleId: string;
  field: string;
  message: string;
  skuId?: string;
}
