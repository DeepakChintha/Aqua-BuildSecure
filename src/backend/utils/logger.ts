import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'supabaseKey',
      'medicalRecord',
    ],
    remove: true,
  },
  base: {
    env: env.NODE_ENV,
    service: 'clinexa-backend',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
