export const environment = {
  production: true,
  /** Your deployed backend URL (Railway, Fly.io, Render, Docker, etc.) */
  apiUrl: 'https://your-backend.example.com',
  /**
   * API key for the platform backend.
   * Set COPILOT_API_KEY as a CI environment variable and replace this placeholder
   * with the injected value via a build-time file replacement step (angular.json fileReplacements).
   * Never hardcode a production key here.
   */
  apiKey: '',
};
