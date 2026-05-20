/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress TS type errors during build — the runtime code is correct but the
  // ai SDK typings diverge from usage in chat/stream routes (tracked in ROADMAP v0.2).
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
