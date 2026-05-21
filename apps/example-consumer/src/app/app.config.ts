import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCopilot,
  providePlatformBackend,
} from '@ankitparekh007/ngx-copilot-sdk';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // SDK configuration — mode, feature flags, status label.
    // apiBaseUrl is not required here because the adapter manages its own URL.
    provideCopilot({
      defaultMode: 'ask',
      statusLabel: 'Connected to platform backend',
    }, {
      // Disable the built-in mock so the platform adapter is used exclusively.
      useMockBackend: false,
    }),

    // Wire the production platform backend adapter as COPILOT_BACKEND_ADAPTER.
    // ⚠️ Never hardcode production apiKey in source. Use environment files
    //    injected at build time via CI secrets.
    // For local mock-only development, remove this block and drop useMockBackend: false.
    ...providePlatformBackend({
      apiUrl: environment.apiUrl,
      apiKey: environment.apiKey,
    }),
  ],
};
