import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import {
  globalRateLimiter,
  sensitiveAuthRateLimiter,
  sensitiveMedicalRecordsRateLimiter,
  sensitiveAdminRateLimiter,
} from './middleware/rateLimit.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { patientRouter } from './routes/patient.routes.js';
import { doctorRouter } from './routes/doctor.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { patientsRouter } from './routes/patients.routes.js';
import { doctorsRouter } from './routes/doctors.routes.js';
import { appointmentsRouter } from './routes/appointments.routes.js';
import { medicalRecordsRouter } from './routes/medicalRecords.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers via Helmet
  app.use(
    helmet({
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'same-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Doctor-Status', 'X-Admin-Reason'],
      credentials: true,
    })
  );

  // Request Body Size Limit (Anti-DoS Protection)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // Structured HTTP Logging
  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }

  // Root & API Index Endpoints for Browser Discovery
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'CLINEXA Backend API',
      version: '1.0.0',
      status: 'operational',
      health: '/health',
      apiBase: '/api/v1',
    });
  });

  app.get('/api/v1', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'CLINEXA API v1',
      status: 'operational',
      endpoints: [
        '/api/v1/auth',
        '/api/v1/patients',
        '/api/v1/doctors',
        '/api/v1/appointments',
        '/api/v1/medical-records',
        '/api/v1/admin',
      ],
    });
  });

  // Application Routes with Sensitive Endpoint Stricter Limits
  app.use(healthRouter);
  app.use('/api/v1/auth', sensitiveAuthRateLimiter, authRouter);
  app.use('/api/v1/medical-records', sensitiveMedicalRecordsRateLimiter, medicalRecordsRouter);
  app.use('/api/v1/appointments', appointmentsRouter);
  app.use('/api/v1/patients', patientsRouter);
  app.use('/api/v1/doctors', doctorsRouter);
  app.use('/api/v1/patient', patientRouter);
  app.use('/api/v1/doctor', doctorRouter);
  app.use('/api/v1/admin', sensitiveAdminRateLimiter, adminRouter);

  // 404 Not Found Middleware
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();

