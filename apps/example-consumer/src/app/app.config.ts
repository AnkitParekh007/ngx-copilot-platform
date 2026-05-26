import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCopilot,
  providePlatformBackend,
} from '@ankit-parekh-007/ngx-copilot-sdk';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideCopilot({
      defaultMode: 'ask',
      statusLabel: 'Connected to platform backend',
    }, {
      useMockBackend: false,
    }),

    // The example consumer validates the live backend contract.
    // Runtime configuration must inject apiUrl/apiKey, and execute mode remains
    // intentionally hidden until a production browser executor is available.
    ...providePlatformBackend({
      apiUrl: environment.apiUrl,
      apiKey: environment.apiKey,
    }),
  ],
};
