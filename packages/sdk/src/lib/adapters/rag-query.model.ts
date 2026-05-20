import { CopilotContext } from '../models/copilot-context.model';

export interface RagQuery {
  query: string;
  context?: CopilotContext;
  limit?: number;
}
