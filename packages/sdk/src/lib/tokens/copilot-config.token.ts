import { EnvironmentProviders, InjectionToken, Provider, makeEnvironmentProviders } from '@angular/core';
import { CopilotBackendAdapter } from '../adapters/copilot-backend.adapter';
import { MockCopilotBackendAdapter } from '../adapters/mock-copilot-backend.adapter';
import { CopilotConfig, CopilotConfigInput, normalizeCopilotConfig } from '../models/copilot-config.model';
import { COPILOT_BACKEND_ADAPTER } from './copilot-backend-adapter.token';

export const COPILOT_CONFIG = new InjectionToken<CopilotConfig>('COPILOT_CONFIG');

export interface ProvideCopilotOptions {
  /**
   * Provide a custom backend adapter.
   * When set, this adapter is used instead of the mock.
   * Use `NgxCopilotPlatformBackendAdapter` for the full platform backend,
   * or supply your own implementation of `CopilotBackendAdapter`.
   */
  backendAdapter?: CopilotBackendAdapter;
  /**
   * Explicitly opt-in to the built-in mock adapter.
   * Defaults to `true` when no `backendAdapter` is provided.
   * Set to `false` only if you provide the adapter via `providePlatformBackend()`
   * or another DI mechanism after the fact.
   */
  useMockBackend?: boolean;
}

/**
 * Register the copilot SDK in your Angular application.
 *
 * **Mock-only (local demo, no backend required):**
 * ```ts
 * provideCopilot({ defaultMode: 'ask' })
 * ```
 *
 * **With a custom backend adapter:**
 * ```ts
 * const adapter = new NgxCopilotPlatformBackendAdapter({ apiUrl, apiKey });
 * provideCopilot({ defaultMode: 'ask' }, { backendAdapter: adapter })
 * ```
 *
 * **With `providePlatformBackend()` (recommended for production):**
 * ```ts
 * provideCopilot({ defaultMode: 'ask' })
 * providePlatformBackend({ apiUrl: environment.apiUrl, apiKey: environment.apiKey })
 * ```
 *
 * All config fields are optional — safe defaults are applied automatically.
 * `apiBaseUrl` is only required when using a real HTTP-backed adapter.
 */
export function provideCopilot(
  config: CopilotConfigInput = {},
  options: ProvideCopilotOptions = {},
): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: COPILOT_CONFIG, useValue: normalizeCopilotConfig(config) },
  ];

  if (options.backendAdapter) {
    // Caller supplied an explicit adapter — wire it directly.
    providers.push({ provide: COPILOT_BACKEND_ADAPTER, useValue: options.backendAdapter });
  } else if (options.useMockBackend !== false) {
    // Default: use the in-process mock so the SDK works without any backend.
    // To switch to a real backend, call providePlatformBackend() or pass backendAdapter.
    providers.push({ provide: COPILOT_BACKEND_ADAPTER, useClass: MockCopilotBackendAdapter });
  }
  // If useMockBackend === false and no backendAdapter, COPILOT_BACKEND_ADAPTER must be
  // provided by a subsequent call (e.g. providePlatformBackend()).

  return makeEnvironmentProviders(providers);
}
