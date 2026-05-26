import { NextRequest, NextResponse } from 'next/server.js'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireMasterApiKey } from '@/lib/admin-auth'
import { hashApiKey } from '@/lib/auth-contract'
import { generateApiKey } from '@/lib/middleware/auth'

export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const forbidden = requireMasterApiKey(auth)
    if (forbidden) return forbidden

    const segments = request.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json({ error: 'Missing API key id', code: 'MISSING_ID' }, { status: 400 })
    }

    const admin = createAdminClient()
    const newKey = generateApiKey()

    const { data, error } = await admin
      .from('api_keys')
      .update({
        key_hash: hashApiKey(newKey),
        last_used_at: null,
        is_active: true,
      })
      .eq('id', id)
      .select('id, name, user_id, permissions, rate_limit_tier, is_active, last_used_at, expires_at, created_at, updated_at')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'API key not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({
      key: newKey,
      record: data,
    })
  },
  {
    requireAuth: true,
    allowedAuthMethods: ['api-key'],
    rateLimit: 'strict',
  },
)
