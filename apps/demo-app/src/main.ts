import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Sentry error tracking — set SENTRY_DSN in your environment to activate.
// The SDK is a no-op when dsn is undefined or empty.
const sentryDsn = (window as unknown as Record<string, unknown>)['__SENTRY_DSN__'] as string | undefined;

Sentry.init({
  dsn: sentryDsn,
  environment: sentryDsn ? 'production' : 'local',
  tracesSampleRate: 0.2,
  // Ignore benign browser extension noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});

bootstrapApplication(AppComponent, appConfig).catch(err => {
  Sentry.captureException(err);
  console.error(err);
});
