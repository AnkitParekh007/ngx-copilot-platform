/**
 * Rate Limiting Middleware using Upstash Redis
 * 
 * Implements multiple rate limit tiers:
 * - Standard: 100 requests/minute for chat endpoints
 * - Heavy: 10 requests/minute for embedding/ingestion
 * - Burst: 1000 requests/minute for lightweight endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Rate limit configurations
export const rateLimiters = {
  // Standard rate limit for chat endpoints
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:standard',
  }),

  // Heavy rate limit for expensive operations (embeddings, AI calls)
  heavy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:heavy',
  }),

  // Ingestion rate limit (very limited due to resource intensity)
  ingestion: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:ingestion',
  }),

  // Burst rate limit for lightweight endpoints
  burst: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    analytics: true,
    prefix: 'ratelimit:burst',
  }),

  // Strict rate limit for auth/approval endpoints
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:strict',
  }),
};

export type RateLimitTier = keyof typeof rateLimiters;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Get identifier for rate limiting
 * Priority: API Key > User ID > IP Address
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string, apiKeyId?: string): string {
  if (apiKeyId) {
    return `apikey:${apiKeyId}`;
  }
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'anonymous';
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 */
export async function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'standard',
  identifier?: string
): Promise<RateLimitResult> {
  const id = identifier || getRateLimitIdentifier(request);
  const limiter = rateLimiters[tier];

  try {
    const { success, limit, remaining, reset } = await limiter.limit(id);

    return {
      success,
      limit,
      remaining,
      reset,
      retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
    };
  } catch (error) {
    // If Redis fails, allow the request but log the error
    console.error('[RateLimit] Redis error:', error);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Rate limit response when limit exceeded
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please retry after ${result.retryAfter} seconds.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: createRateLimitHeaders(result),
    }
  );
}

/**
 * Middleware wrapper with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  tier: RateLimitTier = 'standard'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await rateLimit(request, tier);

    if (!result.success) {
      return rateLimitExceededResponse(result);
    }

    const response = await handler(request);

    // Add rate limit headers to successful response
    const headers = createRateLimitHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Combined auth + rate limit middleware
 */
export async function checkRateLimitWithAuth(
  request: NextRequest,
  tier: RateLimitTier,
  userId?: string,
  apiKeyId?: string
): Promise<RateLimitResult> {
  const identifier = getRateLimitIdentifier(request, userId, apiKeyId);
  return rateLimit(request, tier, identifier);
}
