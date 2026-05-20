/**
 * API Authentication Middleware
 * 
 * Supports multiple authentication methods:
 * 1. API Key via X-API-Key header
 * 2. Bearer token via Authorization header
 * 3. Optional Supabase session for user-specific operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthResult {
  authenticated: boolean;
  method: 'api-key' | 'bearer' | 'supabase-session' | 'none';
  userId?: string;
  apiKeyId?: string;
  error?: string;
}

export interface AuthenticatedRequest extends NextRequest {
  auth: AuthResult;
}

// API keys are stored in environment variables or database
// For production, store hashed API keys in the database
const VALID_API_KEYS = new Set(
  (process.env.COPILOT_API_KEYS || '').split(',').filter(Boolean)
);

// Master API key for admin operations
const MASTER_API_KEY = process.env.COPILOT_MASTER_API_KEY;

/**
 * Verify API key from request headers
 */
export async function verifyApiKey(request: NextRequest): Promise<AuthResult> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key');
  
  if (!apiKey) {
    return { authenticated: false, method: 'none', error: 'No API key provided' };
  }

  // Check master key
  if (MASTER_API_KEY && apiKey === MASTER_API_KEY) {
    return { authenticated: true, method: 'api-key', apiKeyId: 'master' };
  }

  // Check against valid API keys
  if (VALID_API_KEYS.has(apiKey)) {
    return { authenticated: true, method: 'api-key', apiKeyId: hashApiKey(apiKey) };
  }

  // Check database for API key (for dynamic key management)
  const supabase = await createClient();
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, user_id, permissions, expires_at')
    .eq('key_hash', hashApiKey(apiKey))
    .eq('is_active', true)
    .single();

  if (keyRecord) {
    // Check expiration
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return { authenticated: false, method: 'api-key', error: 'API key expired' };
    }
    return { 
      authenticated: true, 
      method: 'api-key', 
      apiKeyId: keyRecord.id,
      userId: keyRecord.user_id 
    };
  }

  return { authenticated: false, method: 'api-key', error: 'Invalid API key' };
}

/**
 * Verify Bearer token (JWT or access token)
 */
export async function verifyBearerToken(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, method: 'none', error: 'No bearer token provided' };
  }

  const token = authHeader.substring(7);
  
  // Verify with Supabase
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { authenticated: false, method: 'bearer', error: error?.message || 'Invalid token' };
  }

  return { authenticated: true, method: 'bearer', userId: user.id };
}

/**
 * Check Supabase session from cookies
 */
export async function verifySupabaseSession(request: NextRequest): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { authenticated: false, method: 'supabase-session', error: 'No valid session' };
  }

  return { authenticated: true, method: 'supabase-session', userId: user.id };
}

/**
 * Main authentication function - tries multiple methods
 */
export async function authenticate(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    allowedMethods?: ('api-key' | 'bearer' | 'supabase-session')[];
  } = {}
): Promise<AuthResult> {
  const { requireAuth = true, allowedMethods = ['api-key', 'bearer', 'supabase-session'] } = options;

  // Try API key first (most common for SDK)
  if (allowedMethods.includes('api-key')) {
    const apiKeyResult = await verifyApiKey(request);
    if (apiKeyResult.authenticated) {
      return apiKeyResult;
    }
  }

  // Try Bearer token
  if (allowedMethods.includes('bearer')) {
    const bearerResult = await verifyBearerToken(request);
    if (bearerResult.authenticated) {
      return bearerResult;
    }
  }

  // Try Supabase session
  if (allowedMethods.includes('supabase-session')) {
    const sessionResult = await verifySupabaseSession(request);
    if (sessionResult.authenticated) {
      return sessionResult;
    }
  }

  // No valid auth found
  if (requireAuth) {
    return { 
      authenticated: false, 
      method: 'none', 
      error: 'Authentication required. Provide X-API-Key header or Authorization: Bearer <token>' 
    };
  }

  return { authenticated: false, method: 'none' };
}

/**
 * Middleware wrapper for protected routes
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<NextResponse>,
  options?: Parameters<typeof authenticate>[1]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await authenticate(request, options);

    if (options?.requireAuth !== false && !auth.authenticated) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: auth.error || 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    return handler(request, auth);
  };
}

/**
 * Simple hash function for API keys (use bcrypt in production for storage)
 */
function hashApiKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `key_${Math.abs(hash).toString(16)}`;
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'cpk_'; // copilot key prefix
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
