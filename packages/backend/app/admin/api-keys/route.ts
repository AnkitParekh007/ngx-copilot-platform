import { NextRequest, NextResponse } from 'next/server.js'
import { z } from 'zod'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireMasterApiKey } from '@/lib/admin-auth'
import { hashApiKey } from '@/lib/auth-contract'
import { generateApiKey } from '@/lib/middleware/auth'

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  userId: z.string().uuid().optional(),
  permissions: z.array(z.string()).min(1).max(20).default(['read', 'write']),
  rateLimitTier: z.enum(['standard', 'heavy', 'ingestion', 'burst', 'strict']).default('standard'),
  expiresAt: z.string().datetime().optional(),
})

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const forbidden = requireMasterApiKey(auth)
    if (forbidden) return forbidden

    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true'
    const admin = createAdminClient()

    let query = admin
      .from('api_keys')
      .select('id, name, user_id, permissions, rate_limit_tier, is_active, last_used_at, expires_at, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`Failed to list API keys: ${error.message}`)
    }

    return NextResponse.json({
      keys: data ?? [],
    })
  },
  {
    requireAuth: true,
    allowedAuthMethods: ['api-key'],
    rateLimit: 'strict',
  },
)

export const POST = createApiHandler(
  async (_request: NextRequest, { auth }, body) => {
    const forbidden = requireMasterApiKey(auth)
    if (forbidden) return forbidden

    const admin = createAdminClient()
    const plaintextKey = generateApiKey()
    const { data, error } = await admin
      .from('api_keys')
      .insert({
        key_hash: hashApiKey(plaintextKey),
        name: body.name,
        user_id: body.userId ?? null,
        permissions: body.permissions,
        rate_limit_tier: body.rateLimitTier,
        expires_at: body.expiresAt ?? null,
        is_active: true,
      })
      .select('id, name, user_id, permissions, rate_limit_tier, is_active, expires_at, created_at')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create API key: ${error?.message ?? 'Unknown error'}`)
    }

    return NextResponse.json(
      {
        key: plaintextKey,
        record: data,
      },
      { status: 201 },
    )
  },
  {
    requireAuth: true,
    allowedAuthMethods: ['api-key'],
    rateLimit: 'strict',
    bodySchema: createApiKeySchema,
  },
)
