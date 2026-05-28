import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCopilot } from '@ankit-parekh-007/ngx-copilot-sdk';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideCopilot({
      apiBaseUrl: '/api/copilot',
      defaultMode: 'plan',
      statusLabel: '0.1.1 preview SDK - local mock demo',
      enableApprovals: true,
      enableRagSources: true,
      enableToolTimeline: true,
    }),
  ],
};
