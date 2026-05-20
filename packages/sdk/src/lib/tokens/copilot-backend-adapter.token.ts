import { InjectionToken } from '@angular/core';
import { CopilotBackendAdapter } from '../adapters/copilot-backend.adapter';

export const COPILOT_BACKEND_ADAPTER = new InjectionToken<CopilotBackendAdapter>(
  'COPILOT_BACKEND_ADAPTER',
);
