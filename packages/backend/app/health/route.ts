/**
 * Health Check Endpoint
 * 
 * Monitors the health of all dependencies:
 * - Database (Supabase)
 * - Cache (Upstash Redis)
 * - AI Gateway
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';
import { createPublicApiHandler } from '@/lib/middleware/api-handler';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: {
    database: DependencyStatus;
    cache: DependencyStatus;
    ai: DependencyStatus;
  };
}

interface DependencyStatus {
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  message?: string;
}

const startTime = Date.now();

async function checkDatabase(): Promise<DependencyStatus> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('conversations').select('id').limit(1);
    
    if (error) {
      return { status: 'down', message: error.message, latency: Date.now() - start };
    }
    
    return { status: 'up', latency: Date.now() - start };
  } catch (error) {
    return { 
      status: 'down', 
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start 
    };
  }
}

async function checkCache(): Promise<DependencyStatus> {
  const start = Date.now();
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    
    // Simple ping test
    await redis.set('health_check', Date.now(), { ex: 60 });
    const value = await redis.get('health_check');
    
    if (!value) {
      return { status: 'down', message: 'Read after write failed', latency: Date.now() - start };
    }
    
    return { status: 'up', latency: Date.now() - start };
  } catch (error) {
    return { 
      status: 'down', 
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start 
    };
  }
}

async function checkAI(): Promise<DependencyStatus> {
  const start = Date.now();
  try {
    // Just check if the AI gateway endpoint is reachable
    const response = await fetch('https://ai-gateway.vercel.sh/v1/models', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return { status: 'down', message: `HTTP ${response.status}`, latency: Date.now() - start };
    }
    
    return { status: 'up', latency: Date.now() - start };
  } catch (error) {
    return { 
      status: 'down', 
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start 
    };
  }
}

export const GET = createPublicApiHandler(
  async (request: NextRequest, { requestId }) => {
    const verbose = request.nextUrl.searchParams.get('verbose') === 'true';
    
    // Run health checks in parallel
    const [database, cache, ai] = await Promise.all([
      checkDatabase(),
      checkCache(),
      checkAI(),
    ]);

    const dependencies = { database, cache, ai };
    
    // Determine overall status
    const allUp = Object.values(dependencies).every((d) => d.status === 'up');
    const anyDown = Object.values(dependencies).some((d) => d.status === 'down');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (anyDown) {
      // Database down = unhealthy, others = degraded
      overallStatus = database.status === 'down' ? 'unhealthy' : 'degraded';
    }

    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      dependencies: verbose ? dependencies : {
        database: { status: database.status },
        cache: { status: cache.status },
        ai: { status: ai.status },
      } as typeof dependencies,
    };

    // Return appropriate status code
    const statusCode = overallStatus === 'unhealthy' ? 503 : 
                       overallStatus === 'degraded' ? 200 : 200;

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  },
  { rateLimit: 'burst' }
);

// HEAD request for simple uptime monitoring
export const HEAD = createPublicApiHandler(
  async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('conversations').select('id').limit(1);
    
    if (error) {
      return new NextResponse(null, { status: 503 });
    }
    
    return new NextResponse(null, { status: 200 });
  },
  { rateLimit: 'burst' }
);
