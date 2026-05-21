export type CopilotMode = 'ask' | 'plan' | 'execute' | 'debug';

export interface CopilotConfig {
  /**
   * Base URL of the backend API.
   * Required when using HttpCopilotBackendAdapter or NgxCopilotPlatformBackendAdapter.
   * Optional (and unused) when using MockCopilotBackendAdapter for local demos.
   *
   * @example 'http://localhost:3001'
   * @example 'https://your-backend.example.com'
   */
  apiBaseUrl: string;
  defaultMode: CopilotMode;
  enableApprovals: boolean;
  enableRagSources: boolean;
  enableToolTimeline: boolean;
  statusLabel?: string;
}

/**
 * Input accepted by `provideCopilot()`.
 * All fields are optional — safe defaults are applied by `normalizeCopilotConfig()`.
 * `apiBaseUrl` can be omitted when running with the mock backend (no real HTTP calls).
 */
export type CopilotConfigInput = Partial<CopilotConfig>;

export const DEFAULT_COPILOT_CONFIG: CopilotConfig = {
  apiBaseUrl: '',
  defaultMode: 'ask',
  enableApprovals: true,
  enableRagSources: true,
  enableToolTimeline: true,
  statusLabel: 'Experimental architecture reference',
};

export function normalizeCopilotConfig(config: CopilotConfigInput = {}): CopilotConfig {
  return {
    ...DEFAULT_COPILOT_CONFIG,
    ...config,
  };
}
