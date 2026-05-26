import test from 'node:test'
import assert from 'node:assert/strict'
import { MissingConfigError } from '../lib/config.ts'
import { buildErrorBody } from '../lib/api-contract.ts'
import { mapSourceToRagResult, serializeSseEvent } from '../lib/contracts.ts'
import { extractApiKeyFromHeaders, hashApiKey, isApiKeyToken } from '../lib/auth-contract.ts'
import type { CopilotEvent } from '../lib/types/copilot.ts'
import type { ExtendedSource } from '../lib/services/rag.ts'

test('extractApiKeyFromHeaders reads cpk_* from Authorization bearer header', () => {
  const headers = new Headers({
    Authorization: 'Bearer cpk_launch_contract_key',
  })

  assert.equal(extractApiKeyFromHeaders(headers), 'cpk_launch_contract_key')
  assert.equal(isApiKeyToken('cpk_launch_contract_key'), true)
  assert.equal(isApiKeyToken('sb_user_jwt'), false)
})

test('hashApiKey uses sha256-prefixed digest', () => {
  const hashed = hashApiKey('cpk_launch_contract_key')
  assert.match(hashed, /^sha256_[a-f0-9]{64}$/)
})

test('buildErrorBody preserves public error contract fields', () => {
  const configError = new MissingConfigError('openai', ['OPENAI_API_KEY'])
  const payload = buildErrorBody({
    error: 'Service Unavailable',
    message: configError.message,
    code: configError.code,
    requestId: 'req_contract_123',
    details: {
      service: configError.service,
      missingVars: configError.missingVars,
    },
  })

  assert.equal(payload.code, 'SERVICE_NOT_CONFIGURED')
  assert.equal(payload.requestId, 'req_contract_123')
  assert.equal((payload.details as { service: string }).service, 'openai')
  assert.deepEqual((payload.details as { missingVars: string[] }).missingVars, ['OPENAI_API_KEY'])
})

test('serializeSseEvent emits platform-compatible SSE chunks', () => {
  const event: CopilotEvent = { type: 'done' }
  const chunk = serializeSseEvent(event)

  assert.equal(chunk, 'data: {"type":"done"}\n\n')
})

test('mapSourceToRagResult produces raw RagResult[] contract entries', () => {
  const source: ExtendedSource = {
    id: 'chunk-1',
    type: 'code',
    title: 'Upload Component',
    filePath: 'src/app/upload/upload.component.ts',
    content: 'The upload component handles CSV ingestion and validation.',
    similarity: 0.93,
    componentType: 'component',
    repoSlug: 'ngx-copilot-platform',
    branch: 'main',
    tags: ['upload', 'csv'],
  }

  const result = mapSourceToRagResult(source, 24)

  assert.deepEqual(result, {
    id: 'chunk-1',
    title: 'Upload Component',
    snippet: 'The upload component han',
    score: 0.93,
    sourceType: 'code',
    sourceUrl: undefined,
    filePath: 'src/app/upload/upload.component.ts',
    fileKind: 'component',
    repo: 'ngx-copilot-platform',
    branch: 'main',
    chunkId: 'chunk-1',
    tags: ['upload', 'csv'],
  })
})
