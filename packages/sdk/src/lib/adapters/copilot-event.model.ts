import { ApprovalRequest } from '../models/approval-request.model';
import { CopilotMessage } from '../models/copilot-message.model';
import { RagResult } from '../models/rag-result.model';
import { ToolTimelineItem } from '../models/tool-timeline-item.model';
import { CopilotAdapterError } from './copilot-adapter-error.model';

export type CopilotEvent =
  | { type: 'session-started'; sessionId: string }
  | { type: 'message-start'; messageId: string }
  | { type: 'message-chunk'; messageId: string; content: string }
  | { type: 'message-complete'; message: CopilotMessage }
  | { type: 'sources'; sources: RagResult[] }
  | { type: 'tool-timeline'; items: ToolTimelineItem[] }
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'approval-resolved'; requestId: string; decision: 'approved' | 'rejected' }
  | { type: 'done' }
  | { type: 'error'; error: CopilotAdapterError };
