export type CopilotMode = 'ask' | 'plan' | 'execute' | 'debug';

export interface CopilotConfig {
  apiBaseUrl: string;
  defaultMode: CopilotMode;
  enableApprovals: boolean;
  enableRagSources: boolean;
  enableToolTimeline: boolean;
  statusLabel?: string;
}

export type CopilotConfigInput = Pick<CopilotConfig, 'apiBaseUrl'> & Partial<CopilotConfig>;

export const DEFAULT_COPILOT_CONFIG: Omit<CopilotConfig, 'apiBaseUrl'> = {
  defaultMode: 'ask',
  enableApprovals: true,
  enableRagSources: true,
  enableToolTimeline: true,
  statusLabel: 'Experimental architecture reference',
};

export function normalizeCopilotConfig(config: CopilotConfigInput): CopilotConfig {
  return {
    ...DEFAULT_COPILOT_CONFIG,
    ...config,
  };
}
