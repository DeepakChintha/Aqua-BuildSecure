import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  logger.error(
    {
      err: {
        message: err.message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
        code: errorCode,
      },
      req: {
        method: req.method,
        url: req.url,
      },
    },
    'Handled server error'
  );

  const response: {
    success: boolean;
    error: {
      code: string;
      message: string;
      stack?: string;
    };
  } = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
    },
  };

  if (env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
