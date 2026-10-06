import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  requireRole,
  requireDoctorAuthorization,
  preventDoctorSelfApproval,
} from '../middleware/rbac.middleware.js';

export const doctorRouter = Router();

// Apply authentication to all doctor routes
doctorRouter.use(authenticate);

/**
 * GET /api/v1/doctor/profile/:doctorId
 * Doctor can access own profile.
 */
doctorRouter.get(
  '/profile/:doctorId',
  requireRole('doctor', 'admin'),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        doctor_id: req.params.doctorId,
        user_id: req.user?.id,
        specialization: 'Cardiology',
        status: 'approved',
      },
    });
  }
);

/**
 * GET /api/v1/doctor/appointments
 * Doctor can access assigned appointments.
 */
doctorRouter.get(
  '/appointments',
  requireRole('doctor', 'admin'),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        doctor_id: req.user?.doctor_id || req.user?.id,
        appointments: [
          {
            id: 'app-10000000-0000-0000-0000-000000000001',
            patient_id: 'pat-10000000-0000-0000-0000-000000000001',
            appointment_date: '2026-10-10',
            appointment_time: '10:00:00',
            status: 'confirmed',
          },
        ],
      },
    });
  }
);

/**
 * POST /api/v1/doctor/medical-records
 * Doctor can create authorized medical records for assigned patients.
 */
doctorRouter.post(
  '/medical-records',
  requireRole('doctor', 'admin'),
  requireDoctorAuthorization,
  (req: Request, res: Response) => {
    const { patient_id, diagnosis, notes, prescription } = req.body;

    if (!patient_id || !diagnosis) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'patient_id and diagnosis are required',
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: 'rec-' + Date.now(),
        patient_id,
        doctor_id: req.user?.doctor_id || req.user?.id,
        diagnosis,
        notes: notes || '',
        prescription: prescription || '',
        created_at: new Date().toISOString(),
      },
    });
  }
);

/**
 * GET /api/v1/doctor/medical-records/:recordId
 * Doctor can access authorized patient medical records.
 */
doctorRouter.get(
  '/medical-records/:recordId',
  requireRole('doctor', 'admin'),
  requireDoctorAuthorization,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        id: req.params.recordId,
        doctor_id: req.user?.doctor_id || req.user?.id,
        patient_id: 'pat-10000000-0000-0000-0000-000000000001',
        diagnosis: 'Hypertension',
        notes: 'Regular monitoring required',
      },
    });
  }
);

/**
 * PATCH /api/v1/doctor/status (Security Check: Doctors cannot self-approve)
 */
doctorRouter.patch(
  '/status',
  requireRole('doctor'),
  preventDoctorSelfApproval,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: { status: req.body.status },
    });
  }
);
