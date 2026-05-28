import { NextRequest, NextResponse } from 'next/server.js';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { extractApiKeyFromHeaders, hashApiKey, isApiKeyToken } from '../auth-contract';

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

const VALID_API_KEYS = new Set(
  (process.env.COPILOT_API_KEYS || '').split(',').filter(Boolean)
);

// Master API key for admin operations
const MASTER_API_KEY = process.env.COPILOT_MASTER_API_KEY;

export async function verifyApiKey(request: NextRequest): Promise<AuthResult> {
  const apiKey = extractApiKey(request);
  
  if (!apiKey) {
    return { authenticated: false, method: 'none', error: 'No API key provided' };
  }

  // Check master key — use constant-time comparison to prevent timing attacks
  if (MASTER_API_KEY) {
    const a = Buffer.from(apiKey);
    const b = Buffer.from(MASTER_API_KEY);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return { authenticated: true, method: 'api-key', apiKeyId: 'master' };
    }
  }

  // Check against valid API keys
  if (VALID_API_KEYS.has(apiKey)) {
    return { authenticated: true, method: 'api-key', apiKeyId: hashApiKey(apiKey) };
  }

  const keyHashes = [hashApiKey(apiKey)];
  const legacyHash = hashApiKeyLegacy(apiKey);
  if (!keyHashes.includes(legacyHash)) {
    keyHashes.push(legacyHash);
  }

  const supabase = await createClient();
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, user_id, permissions, expires_at')
    .in('key_hash', keyHashes)
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

export async function verifyBearerToken(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, method: 'none', error: 'No bearer token provided' };
  }

  const token = authHeader.substring(7);
  if (isApiKeyToken(token)) {
    return { authenticated: false, method: 'bearer', error: 'Bearer API keys are validated by API-key auth' };
  }
  
  // Verify with Supabase
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { authenticated: false, method: 'bearer', error: error?.message || 'Invalid token' };
  }

  return { authenticated: true, method: 'bearer', userId: user.id };
}

export async function verifySupabaseSession(request: NextRequest): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { authenticated: false, method: 'supabase-session', error: 'No valid session' };
  }

  return { authenticated: true, method: 'supabase-session', userId: user.id };
}

export async function authenticate(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    allowedMethods?: ('api-key' | 'bearer' | 'supabase-session')[];
  } = {}
): Promise<AuthResult> {
  const { requireAuth = true, allowedMethods = ['api-key', 'bearer', 'supabase-session'] } = options;

  // Try API key first. Production SDK clients send Authorization: Bearer cpk_*.
  if (allowedMethods.includes('api-key')) {
    const apiKeyResult = await verifyApiKey(request);
    if (apiKeyResult.authenticated) {
      return apiKeyResult;
    }
  }

  // Try Bearer token for non-API-key user auth.
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
      error: 'Authentication required. Provide Authorization: Bearer cpk_* for API access or a valid Supabase bearer/session token.' 
    };
  }

  return { authenticated: false, method: 'none' };
}

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

export function hashApiKeyLegacy(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `key_${Math.abs(hash).toString(16)}`;
}

export function generateApiKey(): string {
  return `cpk_${randomBytes(24).toString('base64url')}`;
}

export function extractApiKey(request: NextRequest): string | null {
  return extractApiKeyFromHeaders(request.headers);
}
