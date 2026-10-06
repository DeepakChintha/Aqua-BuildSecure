import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SUPABASE_URL: z
    .string()
    .url({ message: 'SUPABASE_URL must be a valid URL' })
    .default('https://mock-project.supabase.co'),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default('mock-publishable-key'),
  SUPABASE_SECRET_KEY: z.string().min(1).default('mock-secret-key'),
  SUPABASE_JWKS_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables detected:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
