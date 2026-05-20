export const environment = {
  production: true,
  /** Your deployed backend URL (Railway, Fly.io, Render, Docker, etc.) */
  apiUrl: 'https://your-backend.example.com',
  /** Injected at build time via CI environment variables */
  apiKey: process.env['COPILOT_API_KEY'] ?? '',
};
