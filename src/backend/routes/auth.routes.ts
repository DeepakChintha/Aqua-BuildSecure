import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { SecurityDetector } from '../services/securityDetector.service.js';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  full_name: z.string().min(1, { message: 'Full name is required' }),
  role: z.enum(['patient', 'doctor', 'admin']).default('patient'),
});

const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

authRouter.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input payload',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const { email, password, full_name, role } = parseResult.data;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
      },
    });

    if (error || !data.user) {
      logger.warn({ err: error?.message }, 'Supabase user signup failed');
      res.status(400).json({
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: error?.message || 'Failed to create user account',
        },
      });
      return;
    }

    // Insert corresponding profile record in public.profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      user_id: data.user.id,
      full_name,
      role,
    });

    if (profileError) {
      logger.warn({ err: profileError.message }, 'Created auth user but profile insert returned notice');
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          role,
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_in: data.session.expires_in,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/signin', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = signinSchema.safeParse(req.body);
    if (!parseResult.success) {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      SecurityDetector.trackFailedAuth(req.body?.email || clientIp, clientIp);
      recordAuditLog({
        action: 'LOGIN_FAILURE',
        resource_type: 'auth',
        result: 'failure',
        ip: clientIp,
        user_agent: req.get('User-Agent'),
        metadata: { reason: 'Validation error', email: req.body?.email },
      });
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password input',
        },
      });
      return;
    }

    const { email, password } = parseResult.data;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      logger.warn({ err: error?.message }, 'Supabase user signin failed');
      SecurityDetector.trackFailedAuth(email, clientIp);
      recordAuditLog({
        action: 'LOGIN_FAILURE',
        resource_type: 'auth',
        result: 'failure',
        ip: clientIp,
        user_agent: req.get('User-Agent'),
        metadata: { email, reason: error?.message || 'Invalid credentials' },
      });
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    recordAuditLog({
      user_id: data.user.id,
      action: 'LOGIN_SUCCESS',
      resource_type: 'auth',
      resource_id: data.user.id,
      result: 'success',
      ip: clientIp,
      user_agent: req.get('User-Agent'),
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        token_type: 'Bearer',
      },
    });
  } catch (err) {
    next(err);
  }
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  redirectTo: z.string().url().optional(),
});

authRouter.post('/reset-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email address',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const { email, redirectTo } = parseResult.data;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      logger.warn({ err: error.message }, 'Supabase resetPasswordForEmail failed');
      res.status(400).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_FAILED',
          message: error.message,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (req.user) {
    recordAuditLog({
      user_id: req.user.id,
      action: 'LOGOUT',
      resource_type: 'auth',
      resource_id: req.user.id,
      result: 'success',
      ip: clientIp,
      user_agent: req.get('User-Agent'),
    });
  }
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

authRouter.get('/me', authenticate, (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

