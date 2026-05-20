import { streamText, generateText } from 'ai'
import { tool } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { copilotTools } from '@/lib/services/copilot-tools'
import { hybridSearch, buildContextFromSources } from '@/lib/services/rag'
import { logAuditEvent } from '@/lib/services/audit'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { chatRequestSchema } from '@/lib/middleware/validation'
import type { 
  CopilotMode, 
  CopilotResponse,
  CopilotEvent,
  CopilotMessage,
  RagResult,
  ToolTimelineItem,
} from '@/lib/types/copilot'

const SYSTEM_PROMPTS: Record<CopilotMode, string> = {
  ask: `You are an expert Angular development assistant with deep knowledge of the application's documentation and codebase.

Your role in ASK mode:
- Answer questions using the available context from documentation and code
- Always cite your sources with specific references (URLs for docs, file paths for code)
- Provide clear, accurate answers with confidence levels when possible
- Suggest follow-up questions that would help the user learn more
- If you're unsure, say so and explain what additional context would help

When answering:
1. First search the knowledge base for relevant context
2. Synthesize information from multiple sources if needed
3. Include source references in your response
4. Generate helpful follow-up suggestions`,

  plan: `You are a workflow planning assistant for an Angular application.

Your role in PLAN mode:
- Analyze user requests and create detailed step-by-step execution plans
- Consider the current application state and available UI elements
- Identify assumptions, prerequisites, and potential risks
- Break complex workflows into atomic, verifiable steps
- Always request approval before any plan can be executed

When planning:
1. Understand the user's goal completely
2. Search for relevant documentation and code context
3. Create a clear, sequential plan with specific actions
4. List all assumptions you're making
5. Identify potential risks or blockers
6. Present the plan for user approval`,

  agent: `You are an autonomous browser agent for an Angular application.

Your role in AGENT mode:
- Execute approved plans or perform requested browser actions
- Navigate the application like a real user
- Interact with UI elements safely and methodically
- Report progress and results in real-time
- Handle errors gracefully and suggest recovery actions
- ALWAYS ask for approval before destructive or sensitive actions

Safety rules:
1. NEVER execute destructive actions without explicit approval
2. NEVER expose credentials, tokens, or sensitive data
3. ALWAYS validate the current page state before acting
4. ALWAYS explain what you're about to do before doing it
5. STOP and report if something unexpected happens`,
}

/**
 * POST /api/copilot/chat - Non-streaming JSON response
 * Compatible with HttpCopilotBackendAdapter.send()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId, auth }, body) => {
    const { conversationId, message, mode, context } = body

    // Log the request
    await logAuditEvent({
      conversationId: conversationId,
      userId: auth.userId,
      actionType: `chat_${mode}`,
      request: message,
      requiresApproval: false,
      requestId,
    })

    // Pre-fetch context for the query
    let ragContext = ''
    let sources: RagResult[] = []
    
    if (mode === 'ask' || mode === 'plan') {
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

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPTS[mode]
    
    if (ragContext) {
      systemPrompt += `\n\n## Available Context\n${ragContext}`
    }
    
    if (context?.currentUrl) {
      systemPrompt += `\n\n## Current Page\nURL: ${context.currentUrl}`
      if (context.pageTitle) systemPrompt += `\nTitle: ${context.pageTitle}`
    }

    // Generate response
    const result = await generateText({
      model: 'anthropic/claude-sonnet-4',
      system: systemPrompt,
      prompt: message,
      tools: getModeTools(mode, conversationId),
      maxSteps: 5,
    })

    const responseMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.text,
      createdAt: new Date().toISOString(),
      sources: sources.length > 0 ? sources : undefined,
    }

    const response: CopilotResponse = {
      message: responseMessage,
      sources: sources.length > 0 ? sources : undefined,
    }

    return NextResponse.json(response)
  },
  {
    requireAuth: true,
    rateLimit: 'heavy',
    bodySchema: chatRequestSchema,
  }
)

/**
 * GET /api/copilot/chat - SSE streaming
 * Compatible with HttpCopilotBackendAdapter.sendStream()
 */
export const GET = createApiHandler(
  async (request: NextRequest, { requestId, auth }) => {
    const url = new URL(request.url)
    const message = url.searchParams.get('message') || ''
    const mode = (url.searchParams.get('mode') || 'ask') as CopilotMode
    const sessionId = url.searchParams.get('sessionId') || undefined

    if (!message) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Message parameter is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      )
    }

    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: CopilotEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }

        try {
          // Send session started
          const newSessionId = sessionId || crypto.randomUUID()
          sendEvent({ type: 'session-started', sessionId: newSessionId })

          // Pre-fetch context
          let ragContext = ''
          let sources: RagResult[] = []
          
          if (mode === 'ask' || mode === 'plan') {
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

          // Build system prompt
          let systemPrompt = SYSTEM_PROMPTS[mode]
          if (ragContext) {
            systemPrompt += `\n\n## Available Context\n${ragContext}`
          }

          const messageId = crypto.randomUUID()
          sendEvent({ type: 'message-start', messageId })

          // Tool timeline items for tracking
          const toolTimeline: ToolTimelineItem[] = []

          // Stream the response
          const result = streamText({
            model: 'anthropic/claude-sonnet-4',
            system: systemPrompt,
            prompt: message,
            tools: getModeTools(mode, newSessionId),
            maxSteps: mode === 'agent' ? 15 : 5,
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

          // Send complete message
          const completeMessage: CopilotMessage = {
            id: messageId,
            role: 'assistant',
            content: fullContent,
            createdAt: new Date().toISOString(),
            sources: sources.length > 0 ? sources : undefined,
          }
          sendEvent({ type: 'message-complete', message: completeMessage })

          // Send sources if any
          if (sources.length > 0) {
            sendEvent({ type: 'sources', sources })
          }

          // Send done
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

    return new Response(stream, {
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

    case 'agent':
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

    default:
      return baseTools
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  })
}
