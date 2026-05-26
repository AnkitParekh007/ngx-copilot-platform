type ConfigService = 'supabase' | 'supabaseAdmin' | 'openai' | 'redis';

const SERVICE_ENV_VARS: Record<ConfigService, string[]> = {
  supabase: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  supabaseAdmin: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  openai: ['OPENAI_API_KEY'],
  redis: ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
};

export class MissingConfigError extends Error {
  readonly code = 'SERVICE_NOT_CONFIGURED';
  readonly status = 503;
  readonly service: ConfigService;
  readonly missingVars: string[];

  constructor(service: ConfigService, missingVars: string[]) {
    super(
      `Missing required ${service} configuration: ${missingVars.join(', ')}. ` +
      `Set the variables in packages/backend/.env.local and retry.`,
    );
    this.name = 'MissingConfigError';
    this.service = service;
    this.missingVars = missingVars;
  }
}

export function getMissingEnvVars(service: ConfigService): string[] {
  return SERVICE_ENV_VARS[service].filter(name => !process.env[name]?.trim());
}

export function hasServiceConfig(service: ConfigService): boolean {
  return getMissingEnvVars(service).length === 0;
}

export function assertServiceConfig(service: ConfigService): void {
  const missingVars = getMissingEnvVars(service);
  if (missingVars.length > 0) {
    throw new MissingConfigError(service, missingVars);
  }
}

export function assertServiceConfigs(services: ConfigService[]): void {
  for (const service of services) {
    assertServiceConfig(service);
  }
}
