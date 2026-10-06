import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication header is missing',
      },
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format. Format must be: Bearer <token>',
      },
    });
    return;
  }

  const token = parts[1];
  if (!token || token.trim() === '') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is empty',
      },
    });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn({ err: error?.message }, 'JWT verification failed via Supabase Auth');
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired authentication token',
        },
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata,
    };

    next();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error during auth verification';
    logger.error({ err: errorMsg }, 'Error during JWT verification');
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Failed to verify authentication token',
      },
    });
  }
};
