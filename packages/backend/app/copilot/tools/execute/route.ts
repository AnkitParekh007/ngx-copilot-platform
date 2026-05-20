import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/services/audit'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { toolExecutionSchema } from '@/lib/middleware/validation'
import type { ToolExecutionEvent, ApprovalRequest } from '@/lib/types/copilot'

/**
 * POST /api/copilot/tools/execute - Tool execution endpoint
 * Compatible with HttpCopilotBackendAdapter.executeTool()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId, auth }, body) => {
    const { toolName, toolCallId, args, conversationId } = body

    // Determine if approval is required
    const requiresApproval = shouldRequireApproval(toolName, args)

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

    // Execute the tool
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
  // Tool dispatcher - implements actual tool execution
  // In production, this would call the appropriate tool handler
  
  switch (toolName) {
    case 'navigate':
      return { success: true, url: args.url, message: `Navigated to ${args.url}` }
    
    case 'click':
      return { success: true, selector: args.selector, message: `Clicked element` }
    
    case 'fill':
      return { success: true, selector: args.selector, message: `Filled input field` }
    
    case 'read':
      return { success: true, content: 'Page content would be here', message: `Read page content` }
    
    case 'screenshot':
      return { success: true, message: `Screenshot captured` }
    
    case 'searchKnowledgeBase':
      return { success: true, results: [], message: `Search completed` }
    
    default:
      return { success: true, message: `Executed ${toolName}` }
  }
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
