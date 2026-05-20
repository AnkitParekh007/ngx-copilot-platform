import { RagResult } from './rag-result.model';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  sources?: RagResult[];
}
