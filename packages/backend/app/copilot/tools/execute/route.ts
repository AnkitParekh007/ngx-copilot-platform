import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/services/audit'
import { hybridSearch, buildContextFromSources, getSelectorsForRoute } from '@/lib/services/rag'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { toolExecutionSchema } from '@/lib/middleware/validation'
import type { ToolExecutionEvent, ApprovalRequest, Plan } from '@/lib/types/copilot'

/**
 * POST /api/copilot/tools/execute - Tool execution endpoint
 * Compatible with HttpCopilotBackendAdapter.executeTool()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId, auth }, body) => {
    const { toolName, toolCallId, args, conversationId } = body

    // Determine if approval is required
    const requiresApproval = shouldRequireApproval(toolName, args)
    const supportedToolNames = new Set(['searchKnowledgeBase', 'getPageSelectors', 'createPlan'])

    // Log the tool execution
    await logAuditEvent({
      conversationId,
      userId: auth.userId,
      apiKeyId: auth.apiKeyId,
      actionType: 'tool_execution',
      actionName: toolName,
      request: JSON.stringify(args),
      requiresApproval,
      requestId,
    })

    // Check if approval is required and not yet provided
    if (requiresApproval) {
      const approvalId = crypto.randomUUID()
      const approvalRequest: ApprovalRequest = {
        id: approvalId,
        title: `Execute ${toolName}`,
        reason: `This action requires your approval before proceeding.`,
        actionSummary: JSON.stringify(args, null, 2),
        riskLevel: determineRiskLevel(toolName, args),
      }

      // Store pending approval in database
      const supabase = await createClient()
      const { error } = await supabase.from('action_queue').insert({
        id: approvalId,
        conversation_id: conversationId,
        action_type: toolName,
        action_details: args,
        risk_level: approvalRequest.riskLevel,
        status: 'pending_approval',
      })

      if (error) {
        console.error(`[${requestId}] Failed to create approval request:`, error)
      }

      const response: ToolExecutionEvent = {
        type: 'approval-required',
        request: approvalRequest,
      }

      return NextResponse.json(response)
    }

    if (!supportedToolNames.has(toolName)) {
      const failedResponse: ToolExecutionEvent = {
        type: 'failed',
        requestId: toolCallId,
        error: `Tool "${toolName}" is not enabled for public launch.`,
      }

      return NextResponse.json(failedResponse, { status: 501 })
    }

    try {
      const startTime = Date.now()
      const output = await executeToolByName(toolName, args)
      const durationMs = Date.now() - startTime

      // Log successful execution
      await logAuditEvent({
        conversationId,
        userId: auth.userId,
        actionType: 'tool_execution_completed',
        actionName: toolName,
        request: JSON.stringify(args),
        result: output,
        requiresApproval: false,
        requestId,
        durationMs,
      })
      
      const completedResponse: ToolExecutionEvent = {
        type: 'completed',
        requestId: toolCallId,
        output,
      }

      return NextResponse.json(completedResponse)
    } catch (error) {
      console.error(`[${requestId}] Tool execution failed:`, error)

      // Log failed execution
      await logAuditEvent({
        conversationId,
        userId: auth.userId,
        actionType: 'tool_execution_failed',
        actionName: toolName,
        request: JSON.stringify(args),
        error: error instanceof Error ? error.message : 'Unknown error',
        requiresApproval: false,
        requestId,
      })

      const failedResponse: ToolExecutionEvent = {
        type: 'failed',
        requestId: toolCallId,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      }

      return NextResponse.json(failedResponse, { status: 500 })
    }
  },
  {
    requireAuth: true,
    rateLimit: 'strict',
    bodySchema: toolExecutionSchema,
  }
)

function shouldRequireApproval(toolName: string, args: Record<string, unknown>): boolean {
  const highRiskTools = ['delete', 'submit', 'publish', 'approve', 'reject', 'executeBrowserAction']
  const toolLower = toolName.toLowerCase()
  
  // Check for high-risk tool names
  if (highRiskTools.some(t => toolLower.includes(t))) {
    return true
  }

  // Check for destructive actions in args
  if (args.action && typeof args.action === 'string') {
    const action = args.action.toLowerCase()
    if (['delete', 'remove', 'destroy', 'publish', 'submit'].includes(action)) {
      return true
    }
  }
  
  return false
}

function determineRiskLevel(toolName: string, args: Record<string, unknown>): 'low' | 'medium' | 'high' {
  const highRiskTools = ['delete', 'submit', 'publish', 'approve', 'reject']
  const mediumRiskTools = ['fill', 'click', 'upload', 'update', 'edit']
  
  const toolLower = toolName.toLowerCase()
  
  if (highRiskTools.some(t => toolLower.includes(t))) {
    return 'high'
  }
  
  if (mediumRiskTools.some(t => toolLower.includes(t))) {
    return 'medium'
  }
  
  return 'low'
}

async function executeToolByName(toolName: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  switch (toolName) {
    case 'searchKnowledgeBase':
      return executeKnowledgeSearch(args)
    case 'getPageSelectors':
      return executeGetPageSelectors(args)
    case 'createPlan':
      return executeCreatePlan(args)
    default:
      throw new Error(`Tool "${toolName}" is not enabled for public launch.`)
  }
}

async function executeKnowledgeSearch(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const query = typeof args.query === 'string' ? args.query : ''
  if (!query) {
    throw new Error('searchKnowledgeBase requires a string "query" argument.')
  }

  const includeDocumentation = args.includeDocumentation !== false
  const includeCode = args.includeCode !== false
  const limit = typeof args.limit === 'number' ? args.limit : 5
  const results = await hybridSearch(query, {
    documentLimit: includeDocumentation ? limit : 0,
    codeLimit: includeCode ? limit : 0,
    includeDocumentation,
    includeCode,
  })

  return {
    sources: results.sources,
    context: buildContextFromSources(results.sources),
    documentCount: results.documentResults.length,
    codeCount: results.codeResults.length,
  }
}

async function executeGetPageSelectors(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const route = typeof args.route === 'string' ? args.route : ''
  if (!route) {
    throw new Error('getPageSelectors requires a string "route" argument.')
  }

  const selectors = await getSelectorsForRoute(route)
  return {
    route,
    selectors,
    count: selectors.length,
  }
}

function executeCreatePlan(args: Record<string, unknown>): Record<string, unknown> {
  const goal = typeof args.goal === 'string' ? args.goal : ''
  if (!goal) {
    throw new Error('createPlan requires a string "goal" argument.')
  }

  const stepsInput = Array.isArray(args.steps) ? args.steps : []
  const assumptions = Array.isArray(args.assumptions) ? args.assumptions.filter(isString) : []
  const risks = Array.isArray(args.risks) ? args.risks.filter(isString) : []

  const plan: Plan = {
    id: crypto.randomUUID(),
    goal,
    steps: stepsInput.map((step, index) => {
      const stepRecord = isRecord(step) ? step : {}
      return {
        id: `step-${index + 1}`,
        description: typeof stepRecord.description === 'string' ? stepRecord.description : `Step ${index + 1}`,
        actionType: isBrowserActionType(stepRecord.actionType) ? stepRecord.actionType : 'read',
        target: isRecord(stepRecord.target) ? stepRecord.target : undefined,
        status: 'pending',
      }
    }),
    assumptions,
    risks,
    status: 'pending',
  }

  return {
    plan,
    requiresApproval: true,
    message: `Created plan with ${plan.steps.length} steps. Waiting for user approval before execution.`,
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isBrowserActionType(value: unknown): value is Plan['steps'][number]['actionType'] {
  return typeof value === 'string' && [
    'navigate',
    'click',
    'fill',
    'select',
    'upload',
    'scroll',
    'wait',
    'read',
    'validate',
    'screenshot',
    'hover',
  ].includes(value)
}

// Handle OPTIONS for CORS preflight
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
