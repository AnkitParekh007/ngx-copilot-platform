/**
 * Middleware Exports
 * 
 * Central export for all middleware utilities
 */

// Authentication
export { 
  authenticate, 
  verifyApiKey, 
  verifyBearerToken, 
  verifySupabaseSession,
  withAuth,
  generateApiKey,
  type AuthResult,
} from './auth';

// Rate Limiting
export {
  rateLimit,
  rateLimiters,
  getRateLimitIdentifier,
  createRateLimitHeaders,
  rateLimitExceededResponse,
  withRateLimit,
  checkRateLimitWithAuth,
  type RateLimitTier,
  type RateLimitResult,
} from './rate-limit';

// Validation
export {
  validateBody,
  validateQuery,
  validationErrorResponse,
  schemas,
  // Individual schemas
  chatRequestSchema,
  chatStreamRequestSchema,
  ragQuerySchema,
  toolExecutionSchema,
  approvalResolutionSchema,
  documentationIngestionSchema,
  githubIngestionSchema,
  bitbucketIngestionSchema,
  ingestionJobQuerySchema,
  healthCheckSchema,
  paginationSchema,
  copilotModeSchema,
  copilotMessageSchema,
  copilotContextSchema,
  uuidSchema,
  type ValidationResult,
} from './validation';

// Security & CORS
export {
  getCorsHeaders,
  getSecurityHeaders,
  handleCorsPreFlight,
  isOriginAllowed,
  generateRequestId,
  addSecurityHeaders,
  withSecurityHeaders,
  createSecureHandler,
} from './security';

// Unified API Handler
export {
  createApiHandler,
  createPublicApiHandler,
  createRateLimitedHandler,
  type ApiContext,
  type ApiHandlerOptions,
} from './api-handler';
