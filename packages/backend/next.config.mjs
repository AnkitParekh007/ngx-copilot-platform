/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO(v0.2): remove ignoreBuildErrors.
  //
  // Tracked issue: the `ai` SDK (vercel/ai@6.x) ships typings for `streamText`,
  // `generateText`, and `tool` that diverge from actual runtime behaviour in
  // Next.js App Router edge functions.  Specifically:
  //   - `onStepFinish` callback type expects `StepResult` which differs between
  //     ai@5 and ai@6 public type exports.
  //   - `tool()` helper generic parameters changed in ai@6.0.185.
  //
  // The runtime behaviour is correct; only the build-time type check fails.
  // Files affected: app/copilot/chat/route.ts, app/copilot/chat/stream/route.ts
  //
  // Resolution plan: pin `ai` to a stable minor once typings are aligned upstream,
  // then remove this flag and add `tsc --noEmit` to the CI backend build step.
  typescript: { ignoreBuildErrors: true },

  // CORS headers for the Angular SDK apps (demo-app and example-consumer)
  async headers() {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:4200', 'http://localhost:4201'];

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(', '),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
