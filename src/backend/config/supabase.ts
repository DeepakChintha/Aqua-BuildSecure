import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
};

export interface SupabaseHealthResult {
  status: 'connected' | 'disconnected' | 'configured_mock';
  details: string;
}

export const checkSupabaseHealth = async (): Promise<SupabaseHealthResult> => {
  try {
    if (env.SUPABASE_URL.includes('mock-project.supabase.co')) {
      return {
        status: 'configured_mock',
        details: 'Supabase configured with placeholder development credentials',
      };
    }

    const client = getSupabaseClient();
    // Simple ping / auth health check without querying application tables
    const { error } = await client.auth.getSession();

    if (error) {
      logger.warn({ err: error.message }, 'Supabase health check returned an auth notice');
      return {
        status: 'disconnected',
        details: 'Failed to reach Supabase auth service',
      };
    }

    return {
      status: 'connected',
      details: 'Supabase connectivity verified',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connectivity error';
    logger.error({ err: errorMsg }, 'Supabase health check error');
    return {
      status: 'disconnected',
      details: 'Supabase service unreachable',
    };
  }
};
