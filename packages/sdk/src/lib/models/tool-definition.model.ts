import { CopilotContext } from './copilot-context.model';

export interface ToolDefinition<TResult = unknown> {
  name: string;
  description: string;
  requiresApproval: boolean;
  execute: (context: CopilotContext, input?: unknown) => Promise<TResult>;
}
