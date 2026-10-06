import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { recordAuditLog, getAuditLogs } from '../utils/auditLogger.js';
import { SecurityDetector } from '../services/securityDetector.service.js';

export const adminRouter = Router();

// Apply authentication & admin RBAC middleware across all administrative endpoints
adminRouter.use(authenticate);
adminRouter.use(requireRole('admin'));

/**
 * GET /api/v1/admin/doctors
 * Admin can view all doctor registrations & statuses.
 */
adminRouter.get('/doctors', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      doctors: [
        {
          id: 'doc-10000000-0000-0000-0000-000000000001',
          full_name: 'Dr. Sarah Jenkins',
          specialization: 'Cardiology',
          status: 'pending',
        },
      ],
    },
  });
});

/**
 * PATCH /api/v1/admin/doctors/:doctorId/status
 * Admin can approve or suspend doctors.
 */
adminRouter.patch('/doctors/:doctorId/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!['approved', 'suspended', 'pending'].includes(status)) {
    SecurityDetector.trackSuspiciousAdminOp(req.user?.id || 'unknown', clientIp, 'INVALID_STATUS_UPDATE');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'status must be one of: approved, suspended, pending',
      },
    });
    return;
  }

  const doctorId = req.params.doctorId;

  if (status === 'approved') {
    recordAuditLog({
      user_id: req.user?.id,
      action: 'DOCTOR_APPROVED',
      resource_type: 'doctors',
      resource_id: doctorId,
      result: 'success',
      ip: clientIp,
      user_agent: req.get('User-Agent'),
    });
  } else if (status === 'suspended') {
    recordAuditLog({
      user_id: req.user?.id,
      action: 'DOCTOR_SUSPENDED',
      resource_type: 'doctors',
      resource_id: doctorId,
      result: 'success',
      ip: clientIp,
      user_agent: req.get('User-Agent'),
    });
  }

  recordAuditLog({
    user_id: req.user?.id,
    action: 'ADMIN_ACTION',
    resource_type: 'doctors',
    resource_id: doctorId,
    result: 'success',
    ip: clientIp,
    user_agent: req.get('User-Agent'),
    metadata: { new_status: status },
  });

  res.status(200).json({
    success: true,
    data: {
      doctor_id: doctorId,
      status,
      updated_by: req.user?.id,
      updated_at: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/v1/admin/audit-logs
 * Admin can view audit logs.
 */
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  const logs = getAuditLogs();
  res.status(200).json({
    success: true,
    data: {
      logs,
    },
  });
});

