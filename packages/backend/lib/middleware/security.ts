/**
 * CORS and Security Headers Middleware
 * 
 * Handles cross-origin requests and adds security headers
 */

import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for CORS
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .filter(Boolean)
  .map((origin) => origin.trim());

// Default allowed origins if not configured
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4200', // Angular dev server
  'http://localhost:3000', // Next.js dev server
  'http://localhost:5173', // Vite dev server
];

const ALL_ALLOWED_ORIGINS = [...new Set([...ALLOWED_ORIGINS, ...DEFAULT_ALLOWED_ORIGINS])];

// Allow all origins in development
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests
  if (isDevelopment) return true; // Allow all in development
  if (ALLOWED_ORIGINS.includes('*')) return true; // Wildcard
  return ALL_ALLOWED_ORIGINS.some((allowed) => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
}

/**
 * CORS headers configuration
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};

  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  headers['Access-Control-Allow-Headers'] = [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Conversation-ID',
  ].join(', ');
  headers['Access-Control-Allow-Credentials'] = 'true';
  headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  headers['Access-Control-Expose-Headers'] = [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
    'Retry-After',
  ].join(', ');

  return headers;
}

/**
 * Security headers configuration
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
    ].join('; '),
  };
}

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Add CORS and security headers to response
 */
export function addSecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  requestId?: string
): NextResponse {
  const corsHeaders = getCorsHeaders(request);
  const securityHeaders = getSecurityHeaders();

  // Add all headers
  Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID for tracing
  if (requestId) {
    response.headers.set('X-Request-ID', requestId);
  }

  return response;
}

/**
 * Middleware wrapper with CORS and security headers
 */
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreFlight(request);
    }

    // Check origin
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json(
        { 
          error: 'CORS Error', 
          message: 'Origin not allowed',
          code: 'CORS_ERROR'
        },
        { status: 403 }
      );
    }

    // Generate request ID
    const requestId = generateRequestId();

    // Execute handler
    const response = await handler(request);

    // Add security headers
    return addSecurityHeaders(response, request, requestId);
  };
}

/**
 * Combined middleware: security + CORS + request ID
 */
export function createSecureHandler(
  handler: (request: NextRequest, context: { requestId: string }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreFlight(request);
    }

    // Check origin
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json(
        { error: 'CORS Error', message: 'Origin not allowed', code: 'CORS_ERROR' },
        { status: 403 }
      );
    }

    // Generate request ID
    const requestId = generateRequestId();

    try {
      // Execute handler with context
      const response = await handler(request, { requestId });
      return addSecurityHeaders(response, request, requestId);
    } catch (error) {
      console.error(`[${requestId}] Unhandled error:`, error);
      const errorResponse = NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          requestId,
        },
        { status: 500 }
      );
      return addSecurityHeaders(errorResponse, request, requestId);
    }
  };
}
