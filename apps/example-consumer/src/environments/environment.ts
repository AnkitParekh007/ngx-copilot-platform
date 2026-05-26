interface RuntimeCopilotConfig {
  apiUrl?: string;
  apiKey?: string;
}

declare global {
  interface Window {
    __COPILOT_RUNTIME_CONFIG__?: RuntimeCopilotConfig;
  }
}

const runtimeConfig =
  typeof window !== 'undefined' ? window.__COPILOT_RUNTIME_CONFIG__ ?? {} : {};

export const environment = {
  production: false,
  apiUrl: runtimeConfig.apiUrl ?? '',
  apiKey: runtimeConfig.apiKey ?? '',
};
