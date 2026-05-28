// Next.js instrumentation hook — runs once on server startup (Node.js runtime only).
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
//
// To activate Sentry:
//   1. Set SENTRY_DSN in your deployment environment (Fly.io / Railway / Render secret)
//   2. Run `pnpm add @sentry/nextjs` if not already installed
//   3. Optionally run `npx @sentry/wizard@latest -i nextjs` for full source-map upload config
export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env['SENTRY_DSN'],
      environment: process.env['NODE_ENV'] ?? 'production',
      tracesSampleRate: 0.1,
      // Capture unhandled promise rejections and uncaught exceptions automatically
    });
  }
}
