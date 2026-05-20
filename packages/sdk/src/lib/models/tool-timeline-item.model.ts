export interface ToolTimelineItem {
  id: string;
  toolName: string;
  summary: string;
  status: 'queued' | 'running' | 'awaiting_approval' | 'succeeded' | 'failed' | 'skipped';
  startedAt?: string;
  finishedAt?: string;
}
