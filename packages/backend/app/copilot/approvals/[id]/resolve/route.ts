import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { approvalResolutionSchema } from '@/lib/middleware/validation'
import type { CopilotEvent } from '@/lib/types/copilot'

/**
 * POST /api/copilot/approvals/[id]/resolve - Resolve approval
 * Compatible with HttpCopilotBackendAdapter.resolveApproval()
 */
export const POST = createApiHandler(
  async (
    request: NextRequest,
    { requestId: reqId, auth },
    body
  ) => {
    // Get the ID from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const idIndex = pathParts.indexOf('approvals') + 1
    const id = pathParts[idIndex]

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Approval ID is required', code: 'MISSING_ID', requestId: reqId },
        { status: 400 }
      )
    }

    const { approved, feedback } = body
    const decision = approved ? 'approved' : 'rejected'

    const supabase = await createClient()

    // Update the action queue
    const { data, error } = await supabase
      .from('action_queue')
      .update({
        status: decision,
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: auth.userId || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`[${reqId}] Database error:`, error)
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update action status', code: 'DB_ERROR', requestId: reqId },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Approval request not found', code: 'NOT_FOUND', requestId: reqId },
        { status: 404 }
      )
    }

    // Log the approval/rejection in audit
    await supabase.from('audit_logs').insert({
      conversation_id: data.conversation_id,
      user_id: auth.userId,
      api_key_id: auth.apiKeyId,
      action_type: approved ? 'action_approved' : 'action_rejected',
      action_name: data.action_type,
      request: `Action ${id} was ${decision}${feedback ? `: ${feedback}` : ''}`,
      target: data.action_details,
      approved_at: approved ? new Date().toISOString() : null,
      approved_by: auth.userId,
      request_id: reqId,
    })

    // Return CopilotEvent format
    const response: CopilotEvent = {
      type: 'approval-resolved',
      requestId: id,
      decision,
    }

    return NextResponse.json(response)
  },
  {
    requireAuth: true,
    rateLimit: 'strict',
    bodySchema: approvalResolutionSchema,
  }
)

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
