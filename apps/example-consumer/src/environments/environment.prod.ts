export const environment = {
  production: true,
  /** Your deployed Vercel backend URL */
  apiUrl: 'https://your-platform-backend.vercel.app',
  /** Injected at build time via CI environment variables */
  apiKey: process.env['COPILOT_API_KEY'] ?? '',
};
