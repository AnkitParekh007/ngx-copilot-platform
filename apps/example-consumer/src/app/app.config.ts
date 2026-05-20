import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCopilot,
  NgxCopilotPlatformBackendAdapter,
  COPILOT_BACKEND_ADAPTER,
} from '@ankitparekh007/ngx-copilot-sdk';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

const platformAdapter = new NgxCopilotPlatformBackendAdapter({
  apiUrl: environment.apiUrl,
  apiKey: environment.apiKey,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Configure the copilot SDK with the real platform backend adapter.
    // Replace NgxCopilotPlatformBackendAdapter with MockCopilotBackendAdapter
    // for local development without a running backend.
    provideCopilot(
      { mode: 'ask', theme: 'system' },
      { backendAdapter: platformAdapter },
    ),

    // Explicitly provide the adapter for direct injection if needed
    { provide: COPILOT_BACKEND_ADAPTER, useValue: platformAdapter },
  ],
};
