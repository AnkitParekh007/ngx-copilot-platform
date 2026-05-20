import { EnvironmentProviders, InjectionToken, Provider, makeEnvironmentProviders } from '@angular/core';
import { CopilotBackendAdapter } from '../adapters/copilot-backend.adapter';
import { MockCopilotBackendAdapter } from '../adapters/mock-copilot-backend.adapter';
import { CopilotConfig, CopilotConfigInput, normalizeCopilotConfig } from '../models/copilot-config.model';
import { COPILOT_BACKEND_ADAPTER } from './copilot-backend-adapter.token';

export const COPILOT_CONFIG = new InjectionToken<CopilotConfig>('COPILOT_CONFIG');

export interface ProvideCopilotOptions {
  /** Override the default {@link MockCopilotBackendAdapter}. */
  backendAdapter?: CopilotBackendAdapter;
  /** Use the built-in mock adapter (default when omitted). */
  useMockBackend?: boolean;
}

export function provideCopilot(
  config: CopilotConfigInput,
  options: ProvideCopilotOptions = {},
): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: COPILOT_CONFIG, useValue: normalizeCopilotConfig(config) },
  ];

  if (options.backendAdapter) {
    providers.push({ provide: COPILOT_BACKEND_ADAPTER, useValue: options.backendAdapter });
  } else if (options.useMockBackend !== false) {
    providers.push({ provide: COPILOT_BACKEND_ADAPTER, useClass: MockCopilotBackendAdapter });
  }

  return makeEnvironmentProviders(providers);
}
