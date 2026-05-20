/**
 * Channel Models
 * RetailOps PXM - Channel Syndication
 */

export interface Channel {
  id: string;
  name: string;
  code: string;
  type: ChannelType;
  status: ChannelStatus;
  config: ChannelConfig;
  mappings: AttributeMapping[];
  validationRules: ChannelValidationRule[];
  stats: ChannelStats;
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelType = 'marketplace' | 'retailer' | 'wholesale' | 'direct' | 'social';

export type ChannelStatus = 'active' | 'inactive' | 'pending' | 'error';

export interface ChannelConfig {
  apiEndpoint?: string;
  apiKey?: string;
  feedFormat: 'json' | 'xml' | 'csv';
  feedFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  timezone: string;
  currency: string;
  locale: string;
  autoPublish: boolean;
  requireApproval: boolean;
}

export interface AttributeMapping {
  sourceField: string;
  targetField: string;
  transform?: TransformRule;
  required: boolean;
  defaultValue?: string;
}

export interface TransformRule {
  type: 'uppercase' | 'lowercase' | 'truncate' | 'prefix' | 'suffix' | 'replace' | 'custom';
  params?: Record<string, unknown>;
}

export interface ChannelValidationRule {
  field: string;
  rule: ValidationRuleType;
  params?: Record<string, unknown>;
  errorMessage: string;
}

export type ValidationRuleType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'enum'
  | 'range'
  | 'imageSize'
  | 'imageFormat';

export interface ChannelStats {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  errorProducts: number;
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'partial' | 'failed';
}

export interface SyndicationJob {
  id: string;
  channelId: string;
  channelName: string;
  type: 'full' | 'incremental' | 'single';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  errors: SyndicationError[];
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface SyndicationError {
  skuId: string;
  skuCode: string;
  field?: string;
  errorCode: string;
  message: string;
}
