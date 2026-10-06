import { Router, Request, Response, NextFunction } from 'express';
import { checkSupabaseHealth } from '../config/supabase.js';

export const healthRouter = Router();

const getHealthStatus = async (_req: Request, res: Response): Promise<void> => {
  const supabaseHealth = await checkSupabaseHealth();

  res.status(200).json({
    success: true,
    service: 'Clinexa Backend',
    status: 'healthy',
    services: {
      supabase: supabaseHealth,
    },
  });
};

healthRouter.get('/health', (req: Request, res: Response, next: NextFunction) => {
  getHealthStatus(req, res).catch(next);
});

healthRouter.get('/api/v1/health', (req: Request, res: Response, next: NextFunction) => {
  getHealthStatus(req, res).catch(next);
});
