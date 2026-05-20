export const environment = {
  production: false,
  /**
   * Base URL of the ngx-copilot-platform backend (packages/backend).
   * Run `pnpm --filter @ngx-copilot/backend dev` to start it on port 3001.
   */
  apiUrl: 'http://localhost:3001',
  /**
   * API key from your backend .env.local — COPILOT_API_KEYS value.
   * For local dev, use any key listed in packages/backend/.env.local.
   */
  apiKey: 'cpk_dev_replace_with_your_key',
};
