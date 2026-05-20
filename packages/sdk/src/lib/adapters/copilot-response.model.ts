import { CopilotMessage } from '../models/copilot-message.model';
import { RagResult } from '../models/rag-result.model';

export interface CopilotResponse {
  message: CopilotMessage;
  sources?: RagResult[];
}
