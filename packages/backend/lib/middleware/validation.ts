/**
 * Zod Validation Schemas for API Requests
 * 
 * All request bodies must be validated before processing
 */

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// Chat Schemas
// ============================================

export const copilotModeSchema = z.enum(['ask', 'plan', 'execute', 'debug']);

export const copilotMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content is required').max(100000, 'Message too long'),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const copilotContextSchema = z.object({
  currentUrl: z.string().url().optional(),
  pageTitle: z.string().max(500).optional(),
  selectedText: z.string().max(10000).optional(),
  customContext: z.record(z.unknown()).optional(),
});

export const chatRequestSchema = z.object({
  conversationId: uuidSchema.optional(),
  sessionId: uuidSchema.optional(),
  mode: copilotModeSchema.default('ask'),
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
  messages: z.array(copilotMessageSchema).optional(),
  context: copilotContextSchema.optional(),
  stream: z.boolean().default(true),
});

export const chatStreamRequestSchema = z.object({
  conversationId: uuidSchema.optional(),
  mode: copilotModeSchema.default('ask'),
  messages: z.array(copilotMessageSchema).min(1, 'At least one message required'),
  context: copilotContextSchema.optional(),
});

// ============================================
// RAG Query Schemas
// ============================================

export const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(5000, 'Query too long'),
  filters: z.object({
    sources: z.array(z.enum(['documentation', 'code'])).optional(),
    repoSlug: z.string().optional(),
    branch: z.string().optional(),
    componentType: z.string().optional(),
  }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  threshold: z.coerce.number().min(0).max(1).default(0.7),
});

// ============================================
// Tool Execution Schemas
// ============================================

export const toolExecutionSchema = z.object({
  toolName: z.string().min(1, 'Tool name is required').max(100),
  toolCallId: z.string().min(1, 'Tool call ID is required'),
  args: z.record(z.unknown()).default({}),
  conversationId: uuidSchema.optional(),
});

// ============================================
// Approval Schemas
// ============================================

export const approvalResolutionSchema = z.object({
  approved: z.boolean(),
  feedback: z.string().max(1000).optional(),
});

// ============================================
// Ingestion Schemas
// ============================================

export const documentationIngestionSchema = z.object({
  url: z.string().url('Invalid URL format'),
  maxDepth: z.coerce.number().int().min(1).max(10).default(3),
  maxPages: z.coerce.number().int().min(1).max(500).default(100),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  selector: z.string().optional(), // CSS selector for content extraction
});

export const githubIngestionSchema = z.object({
  // Either owner+repo OR repoUrl required
  owner: z.string().min(1).max(100).optional(),
  repo: z.string().min(1).max(100).optional(),
  repoUrl: z.string().url().optional(),
  branch: z.string().max(100).default('main'),
  token: z.string().optional(), // GitHub PAT for private repos
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
}).refine(
  (data) => (data.owner && data.repo) || data.repoUrl,
  { message: 'Either owner+repo or repoUrl is required' }
);

export const bitbucketIngestionSchema = z.object({
  workspace: z.string().min(1, 'Workspace is required'),
  repoSlug: z.string().min(1, 'Repository slug is required'),
  branch: z.string().default('main'),
  username: z.string().min(1, 'Username is required'),
  appPassword: z.string().min(1, 'App password is required'),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
});

export const ingestionJobQuerySchema = z.object({
  jobId: uuidSchema.optional(),
  action: z.enum(['status', 'branches', 'cancel', 'validate']).optional(),
  owner: z.string().optional(),
  repo: z.string().optional(),
});

// ============================================
// Health Check Schemas
// ============================================

export const healthCheckSchema = z.object({
  verbose: z.coerce.boolean().default(false),
});

// ============================================
// Validation Helper Functions
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    issues: z.ZodIssue[];
  };
}

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T extends z.ZodSchema>(
  body: unknown,
  schema: T
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        issues: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): ValidationResult<z.infer<T>> {
  const params: Record<string, string | string[]> = {};
  
  searchParams.forEach((value, key) => {
    if (params[key]) {
      // Handle multiple values for same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return validateBody(params, schema);
}

/**
 * Create validation error response
 */
export function validationErrorResponse(error: NonNullable<ValidationResult<unknown>['error']>) {
  return {
    error: 'Validation Error',
    message: error.message,
    code: 'VALIDATION_ERROR',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}

// Export all schemas
export const schemas = {
  chat: chatRequestSchema,
  chatStream: chatStreamRequestSchema,
  ragQuery: ragQuerySchema,
  toolExecution: toolExecutionSchema,
  approvalResolution: approvalResolutionSchema,
  documentationIngestion: documentationIngestionSchema,
  githubIngestion: githubIngestionSchema,
  bitbucketIngestion: bitbucketIngestionSchema,
  ingestionJobQuery: ingestionJobQuerySchema,
  healthCheck: healthCheckSchema,
  pagination: paginationSchema,
};
