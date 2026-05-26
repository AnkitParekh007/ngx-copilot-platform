import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { mapSourceToRagResult, serializeSseEvent } from '@/lib/contracts'
import { copilotTools } from '@/lib/services/copilot-tools'
import { hybridSearch, buildContextFromSources } from '@/lib/services/rag'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { chatRequestSchema } from '@/lib/middleware/validation'
import { assertServiceConfigs } from '@/lib/config'
import type { 
  CopilotMode, 
  CopilotEvent,
  CopilotMessage,
  RagResult,
} from '@/lib/types/copilot'

const SYSTEM_PROMPTS: Record<CopilotMode, string> = {
  ask: `You are an expert Angular development assistant. Answer questions using available context from documentation and code. Always cite sources.`,
  plan: `You are a workflow planning assistant. Create detailed step-by-step execution plans with assumptions and risks. Request approval before execution.`,
  execute: `You are an execution planning assistant. Refine approved plans into safe steps and never claim a browser action ran unless a production executor confirmed it.`,
  debug: `You are a debugging assistant. Help diagnose issues and suggest fixes with explanations.`,
}

/**
 * POST /api/copilot/chat/stream - SSE streaming endpoint
 * Compatible with NgxCopilotPlatformBackendAdapter.send()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId }, body) => {
    assertServiceConfigs(['supabase', 'openai'])
    const { message, mode, sessionId, context } = body
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: CopilotEvent) => {
          controller.enqueue(encoder.encode(serializeSseEvent(event)))
        }

        try {
          const newSessionId = sessionId || crypto.randomUUID()
          sendEvent({ type: 'session-started', sessionId: newSessionId })

          let ragContext = ''
          let sources: RagResult[] = []

          if (mode === 'ask' || mode === 'plan' || mode === 'debug') {
            try {
              const searchResults = await hybridSearch(message, {
                documentLimit: 5,
                codeLimit: 5,
                threshold: 0.6,
              })
              ragContext = buildContextFromSources(searchResults.sources)
              sources = searchResults.sources.map(source => mapSourceToRagResult(source, 300))
            } catch (error) {
              console.error(`[${requestId}] RAG search failed:`, error)
            }
          }

          let systemPrompt = SYSTEM_PROMPTS[mode]
          if (ragContext) {
            systemPrompt += `\n\n## Available Context\n${ragContext}`
          }
          if (context?.currentUrl) {
            systemPrompt += `\n\n## Current Page\nURL: ${context.currentUrl}`
            if (context.pageTitle) systemPrompt += `\nTitle: ${context.pageTitle}`
          }

          const messageId = crypto.randomUUID()
          sendEvent({ type: 'message-start', messageId })

          const result = streamText({
            model: 'anthropic/claude-sonnet-4',
            system: systemPrompt,
            prompt: message,
            tools: getModeTools(mode, newSessionId),
          })

          let fullContent = ''
          for await (const chunk of result.textStream) {
            fullContent += chunk
            sendEvent({ type: 'message-chunk', messageId, content: chunk })
          }

          const completeMessage: CopilotMessage = {
            id: messageId,
            role: 'assistant',
            content: fullContent,
            createdAt: new Date().toISOString(),
            sources: sources.length > 0 ? sources : undefined,
          }
          sendEvent({ type: 'message-complete', message: completeMessage })

          if (sources.length > 0) {
            sendEvent({ type: 'sources', sources })
          }

          sendEvent({ type: 'done' })
          controller.close()
        } catch (error) {
          console.error(`[${requestId}] Stream error:`, error)
          sendEvent({
            type: 'error',
            error: {
              code: 'STREAM_ERROR',
              message: error instanceof Error ? error.message : 'Stream failed',
              retryable: true,
            },
          })
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  },
  {
    requireAuth: true,
    rateLimit: 'standard',
    bodySchema: chatRequestSchema,
  }
)

function getModeTools(mode: CopilotMode, _sessionId?: string) {
  const baseTools = {
    searchKnowledgeBase: copilotTools.searchKnowledgeBase,
    generateFollowUpSuggestions: copilotTools.generateFollowUpSuggestions,
  }

  switch (mode) {
    case 'ask':
      return {
        ...baseTools,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'plan':
      return {
        ...baseTools,
        createPlan: copilotTools.createPlan,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'execute':
      return {
        ...baseTools,
        createPlan: copilotTools.createPlan,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'debug':
    default:
      return baseTools
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  })
}
