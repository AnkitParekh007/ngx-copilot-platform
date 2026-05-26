import { NextResponse } from 'next/server.js'
import type { AuthResult } from '@/lib/middleware/auth'

export function requireMasterApiKey(auth: AuthResult) {
  if (auth.authenticated && auth.method === 'api-key' && auth.apiKeyId === 'master') {
    return null
  }

  return NextResponse.json(
    {
      error: 'Forbidden',
      message: 'Admin API key access is required for this endpoint.',
      code: 'ADMIN_AUTH_REQUIRED',
    },
    { status: 403 },
  )
}
