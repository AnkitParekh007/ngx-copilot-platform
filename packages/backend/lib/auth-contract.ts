import { createHash } from 'node:crypto'

export function hashApiKey(key: string): string {
  return `sha256_${createHash('sha256').update(key).digest('hex')}`
}

export function isApiKeyToken(token: string): boolean {
  return token.startsWith('cpk_')
}

export function extractApiKeyFromHeaders(headers: Headers): string | null {
  const directHeader = headers.get('X-API-Key') || headers.get('x-api-key')
  if (directHeader) {
    return directHeader
  }

  const authHeader = headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return isApiKeyToken(token) ? token : null
}
