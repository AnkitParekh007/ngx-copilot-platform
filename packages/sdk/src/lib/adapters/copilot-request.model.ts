import { CopilotMode } from '../models/copilot-config.model';
import { CopilotContext } from '../models/copilot-context.model';

export interface CopilotRequest {
  sessionId?: string;
  message: string;
  mode: CopilotMode;
  context?: CopilotContext;
}
