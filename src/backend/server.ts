import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 CLINEXA Backend Server running on port ${PORT} [${env.NODE_ENV}]`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use by another running process.`);
    logger.error(`Please stop the existing process on port ${PORT} or set PORT environment variable.`);
    process.exit(1);
  } else {
    logger.error({ err }, 'Server initialization error');
  }
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server };
