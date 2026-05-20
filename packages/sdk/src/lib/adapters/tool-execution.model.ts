import { ApprovalRequest } from '../models/approval-request.model';

export interface ToolExecutionRequest {
  toolName: string;
  input: Record<string, unknown>;
  requiresApproval: boolean;
  approvalRequestId?: string;
}

export type ToolExecutionEvent =
  | { type: 'started'; toolName: string; requestId: string }
  | { type: 'progress'; requestId: string; summary: string }
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'completed'; requestId: string; output: Record<string, unknown> }
  | { type: 'failed'; requestId: string; error: string };
