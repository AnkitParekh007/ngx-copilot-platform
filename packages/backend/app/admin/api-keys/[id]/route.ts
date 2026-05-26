import { NextRequest, NextResponse } from 'next/server.js'
import { z } from 'zod'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireMasterApiKey } from '@/lib/admin-auth'

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).min(1).max(20).optional(),
  rateLimitTier: z.enum(['standard', 'heavy', 'ingestion', 'burst', 'strict']).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const PATCH = createApiHandler(
  async (request: NextRequest, { auth }, body) => {
    const forbidden = requireMasterApiKey(auth)
    if (forbidden) return forbidden

    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Missing API key id', code: 'MISSING_ID' }, { status: 400 })
    }

    const admin = createAdminClient()
    const updatePayload: Record<string, unknown> = {}
    if (body.name !== undefined) updatePayload.name = body.name
    if (body.permissions !== undefined) updatePayload.permissions = body.permissions
    if (body.rateLimitTier !== undefined) updatePayload.rate_limit_tier = body.rateLimitTier
    if (body.expiresAt !== undefined) updatePayload.expires_at = body.expiresAt
    if (body.isActive !== undefined) updatePayload.is_active = body.isActive

    const { data, error } = await admin
      .from('api_keys')
      .update(updatePayload)
      .eq('id', id)
      .select('id, name, user_id, permissions, rate_limit_tier, is_active, last_used_at, expires_at, created_at, updated_at')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'API key not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    return NextResponse.json({ record: data })
  },
  {
    requireAuth: true,
    allowedAuthMethods: ['api-key'],
    rateLimit: 'strict',
    bodySchema: updateApiKeySchema,
  },
)
