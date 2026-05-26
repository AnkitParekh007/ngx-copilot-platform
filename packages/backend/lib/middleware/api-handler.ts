/**
 * Unified API Handler with all middleware
 * 
 * Combines: Authentication, Rate Limiting, Validation, CORS, Security Headers
 */

import { NextRequest, NextResponse } from 'next/server.js';
import { z } from 'zod';
import { authenticate, AuthResult } from './auth';
import { rateLimit, RateLimitTier, createRateLimitHeaders, rateLimitExceededResponse } from './rate-limit';
import { validateBody, validationErrorResponse, ValidationResult } from './validation';
import { getCorsHeaders, getSecurityHeaders, handleCorsPreFlight, isOriginAllowed, generateRequestId } from './security';
import { MissingConfigError } from '../config';
import { buildErrorBody } from '../api-contract';

export interface ApiContext {
  requestId: string;
  auth: AuthResult;
}

export interface ApiHandlerOptions<T extends z.ZodSchema | undefined = undefined> {
  // Authentication options
  requireAuth?: boolean;
  allowedAuthMethods?: ('api-key' | 'bearer' | 'supabase-session')[];
  
  // Rate limiting options
  rateLimit?: RateLimitTier | false;
  
  // Validation schema for request body
  bodySchema?: T;
  
  // Custom error handler
  onError?: (error: Error, requestId: string) => NextResponse;
}

type HandlerBody<T extends z.ZodSchema | undefined> = T extends z.ZodSchema ? z.infer<T> : unknown;

type ApiHandler<T extends z.ZodSchema | undefined> = (
  request: NextRequest,
  context: ApiContext,
  body: HandlerBody<T>
) => Promise<NextResponse>;

/**
 * Create a production-ready API handler with all middleware
 */
export function createApiHandler<T extends z.ZodSchema | undefined = undefined>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> = {}
) {
  const {
    requireAuth = true,
    allowedAuthMethods = ['api-key', 'bearer', 'supabase-session'],
    rateLimit: rateLimitTier = 'standard',
    bodySchema,
    onError,
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreFlight(request);
    }

    // Check origin
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return createErrorResponse('CORS Error', 'Origin not allowed', 'CORS_ERROR', 403, requestId, request);
    }

    try {
      // 1. Authentication
      const auth = await authenticate(request, { requireAuth, allowedMethods: allowedAuthMethods });
      
      if (requireAuth && !auth.authenticated) {
        return createErrorResponse(
          'Unauthorized',
          auth.error || 'Authentication required',
          'AUTH_REQUIRED',
          401,
          requestId,
          request
        );
      }

      // 2. Rate Limiting
      if (rateLimitTier !== false) {
        const rateLimitResult = await rateLimit(request, rateLimitTier, 
          auth.apiKeyId ? `apikey:${auth.apiKeyId}` : auth.userId ? `user:${auth.userId}` : undefined
        );

        if (!rateLimitResult.success) {
          const response = rateLimitExceededResponse(rateLimitResult);
          addHeaders(response, request, requestId);
          return response;
        }

        // Store rate limit info for later
        (request as unknown as { rateLimitResult: typeof rateLimitResult }).rateLimitResult = rateLimitResult;
      }

      // 3. Body Validation (for POST/PUT/PATCH)
      let validatedBody: HandlerBody<T> = undefined as HandlerBody<T>;
      
      if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return createErrorResponse(
            'Bad Request',
            'Invalid JSON body',
            'INVALID_JSON',
            400,
            requestId,
            request
          );
        }

        const validation = validateBody(rawBody, bodySchema) as ValidationResult<HandlerBody<T>>;
        if (!validation.success) {
          return createErrorResponse(
            'Validation Error',
            'Request validation failed',
            'VALIDATION_ERROR',
            400,
            requestId,
            request,
            validationErrorResponse(validation.error!).details
          );
        }
        validatedBody = validation.data!;
      }

      // 4. Execute Handler
      const context: ApiContext = { requestId, auth };
      const response = await handler(request, context, validatedBody);

      // 5. Add headers to response
      addHeaders(response, request, requestId);

      return response;

    } catch (error) {
      console.error(`[${requestId}] Unhandled error:`, error);

      if (error instanceof MissingConfigError) {
        return createErrorResponse(
          'Service Unavailable',
          error.message,
          error.code,
          error.status,
          requestId,
          request,
          { service: error.service, missingVars: error.missingVars },
        );
      }
      
      if (onError && error instanceof Error) {
        return onError(error, requestId);
      }

      return createErrorResponse(
        'Internal Server Error',
        process.env.NODE_ENV === 'development' && error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred',
        'INTERNAL_ERROR',
        500,
        requestId,
        request
      );
    }
  };
}

/**
 * Create error response with proper headers
 */
function createErrorResponse(
  error: string,
  message: string,
  code: string,
  status: number,
  requestId: string,
  request: NextRequest,
  details?: unknown
): NextResponse {
  const response = NextResponse.json(
    buildErrorBody({ error, message, code, requestId, details }),
    { status }
  );

  addHeaders(response, request, requestId);
  return response;
}

/**
 * Add all headers to response
 */
function addHeaders(response: NextResponse, request: NextRequest, requestId: string): void {
  // CORS headers
  const corsHeaders = getCorsHeaders(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Request ID
  response.headers.set('X-Request-ID', requestId);

  // Rate limit headers (if available)
  const rateLimitResult = (request as unknown as { rateLimitResult?: { limit: number; remaining: number; reset: number } }).rateLimitResult;
  if (rateLimitResult) {
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult as { success: boolean; limit: number; remaining: number; reset: number });
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}

/**
 * Create a handler for public endpoints (no auth required)
 */
export function createPublicApiHandler<T extends z.ZodSchema | undefined = undefined>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions<T>, 'requireAuth'> = {}
) {
  return createApiHandler(handler, { ...options, requireAuth: false });
}

/**
 * Create a handler with custom rate limit
 */
export function createRateLimitedHandler<T extends z.ZodSchema | undefined = undefined>(
  handler: ApiHandler<T>,
  tier: RateLimitTier,
  options: Omit<ApiHandlerOptions<T>, 'rateLimit'> = {}
) {
  return createApiHandler(handler, { ...options, rateLimit: tier });
}

// Export for barrel file
export { validateBody, validateQuery, validationErrorResponse } from './validation';
export type { RateLimitTier } from './rate-limit';
