/**
 * SKU Model
 * Represents a specific product variant (Stock Keeping Unit)
 */
export interface Sku {
  id: string;
  productId: string;
  skuCode: string;
  variantTitle: string;
  price: number;
  cost?: number;
  compareAtPrice?: number;
  inventory: number;
  upc?: string;
  ean?: string;
  mpn?: string;
  weight?: number;
  weightUnit: 'lb' | 'kg' | 'oz' | 'g';
  dimensions?: SkuDimensions;
  variantAttributes: VariantAttribute[];
  images: SkuImage[];
  status: SkuStatus;
  channelData: ChannelSpecificData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SkuDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm';
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface SkuImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
  width: number;
  height: number;
  isPrimary: boolean;
}

export interface ChannelSpecificData {
  channelId: string;
  channelName: string;
  externalId?: string;
  status: ChannelSkuStatus;
  data: Record<string, unknown>;
  lastSyncedAt?: Date;
  errors?: ChannelError[];
}

export interface ChannelError {
  code: string;
  message: string;
  field?: string;
  timestamp: Date;
}

export type SkuStatus =
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

export type ChannelSkuStatus =
  | 'NOT_SYNCED'
  | 'PENDING'
  | 'SYNCED'
  | 'FAILED'
  | 'SUSPENDED';

export interface SkuListItem {
  id: string;
  skuCode: string;
  variantTitle: string;
  price: number;
  inventory: number;
  status: SkuStatus;
  mainImageUrl?: string;
  productTitle: string;
}

export interface SkuFilters {
  search?: string;
  status?: SkuStatus[];
  priceRange?: {
    min: number;
    max: number;
  };
  inventoryRange?: {
    min: number;
    max: number;
  };
  channels?: string[];
}

/**
 * SKU Status Transitions
 * Defines allowed status transitions for business logic validation
 */
export const SKU_STATUS_TRANSITIONS: Record<SkuStatus, SkuStatus[]> = {
  DRAFT: ['PENDING_VALIDATION'],
  PENDING_VALIDATION: ['VALIDATED', 'VALIDATION_FAILED'],
  VALIDATION_FAILED: ['PENDING_VALIDATION', 'DRAFT'],
  VALIDATED: ['PENDING_APPROVAL', 'PENDING_VALIDATION'],
  PENDING_APPROVAL: ['APPROVED', 'AUTO_APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'PENDING_APPROVAL'],
  AUTO_APPROVED: ['PUBLISHED'],
  REJECTED: ['NEEDS_REVISION'],
  NEEDS_REVISION: ['DRAFT', 'PENDING_VALIDATION'],
  PUBLISHED: ['SUSPENDED', 'ARCHIVED'],
  SUSPENDED: ['PUBLISHED', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: SkuStatus,
  targetStatus: SkuStatus
): boolean {
  return SKU_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}
