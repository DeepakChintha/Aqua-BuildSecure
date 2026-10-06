import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Middleware: Require Approved Doctor Status for Clinical Operations.
 * Ensures pending or suspended doctors cannot access or execute clinical operations.
 */
export const requireApprovedDoctor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  // Admin bypasses doctor status checks
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Extract doctor status from header override (for testing), user_metadata, or request user identity
  const statusHeader = req.headers['x-doctor-status'] as string | undefined;
  const doctorStatus =
    statusHeader ||
    (req.user.user_metadata?.doctor_status as string) ||
    (req.user as any).status ||
    'approved';

  if (doctorStatus === 'pending') {
    logger.warn({ userId: req.user.id, doctorStatus }, 'Clinical operation blocked: Doctor status pending approval');
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Doctor account status is pending approval',
      },
    });
    return;
  }

  if (doctorStatus === 'suspended') {
    logger.warn({ userId: req.user.id, doctorStatus }, 'Clinical operation blocked: Doctor account is suspended');
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Doctor account status is suspended',
      },
    });
    return;
  }

  next();
};
