import { streamText, tool } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
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
  ToolTimelineItem,
} from '@/lib/types/copilot'

const SYSTEM_PROMPTS: Record<CopilotMode, string> = {
  ask: `You are an expert Angular development assistant. Answer questions using available context from documentation and code. Always cite sources.`,
  plan: `You are a workflow planning assistant. Create detailed step-by-step execution plans with assumptions and risks. Request approval before execution.`,
  execute: `You are an autonomous browser agent. Execute approved plans safely. Always ask approval for destructive actions.`,
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
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
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
              sources = searchResults.sources.map(s => ({
                id: s.id,
                title: s.title || 'Untitled',
                snippet: s.content.substring(0, 300),
                score: s.similarity,
                sourceType: s.type,
                sourceUrl: s.url,
                filePath: s.filePath,
                fileKind: s.componentType,
                repo: s.repoSlug,
                branch: s.branch,
                chunkId: s.id,
              }))
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

          const toolTimeline: ToolTimelineItem[] = []
          const result = streamText({
            model: 'anthropic/claude-sonnet-4',
            system: systemPrompt,
            prompt: message,
            tools: getModeTools(mode, newSessionId),
            maxSteps: mode === 'execute' ? 15 : 5,
            onStepFinish: async ({ stepType, toolCalls, toolResults }) => {
              if (stepType === 'tool-call' && toolCalls) {
                for (const toolCall of toolCalls) {
                  const timelineItem: ToolTimelineItem = {
                    id: toolCall.toolCallId,
                    toolName: toolCall.toolName,
                    summary: `Executing ${toolCall.toolName}`,
                    status: 'running',
                    startedAt: new Date().toISOString(),
                  }
                  toolTimeline.push(timelineItem)
                  sendEvent({ type: 'tool-timeline', items: [...toolTimeline] })
                }
              }
              if (stepType === 'tool-result' && toolResults) {
                for (const toolResult of toolResults) {
                  const item = toolTimeline.find(t => t.id === toolResult.toolCallId)
                  if (item) {
                    item.status = 'succeeded'
                    item.finishedAt = new Date().toISOString()
                    sendEvent({ type: 'tool-timeline', items: [...toolTimeline] })
                  }
                }
              }
            },
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

function getModeTools(mode: CopilotMode, sessionId?: string) {
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
        executeBrowserAction: tool({
          ...copilotTools.executeBrowserAction,
          execute: async (args) => {
            return copilotTools.executeBrowserAction.execute({
              ...args,
              conversationId: sessionId || 'anonymous',
            })
          },
        }),
        readPageContent: copilotTools.readPageContent,
        validatePageState: copilotTools.validatePageState,
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
