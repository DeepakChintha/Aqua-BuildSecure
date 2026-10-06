import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole, requirePatientOwnership } from '../middleware/rbac.middleware.js';

export const patientRouter = Router();

// Apply authentication to all patient routes
patientRouter.use(authenticate);

/**
 * GET /api/v1/patient/profile/:patientId
 * Patient can access own profile. Admin can access any profile.
 */
patientRouter.get(
  '/profile/:patientId',
  requireRole('patient', 'admin'),
  requirePatientOwnership,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        patient_id: req.params.patientId,
        user_id: req.user?.id,
        full_name: req.user?.user_metadata?.full_name || 'Patient Profile',
        role: req.user?.role,
      },
    });
  }
);

/**
 * GET /api/v1/patient/appointments
 * Patient can access own appointments.
 */
patientRouter.get(
  '/appointments',
  requireRole('patient', 'admin'),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        patient_id: req.user?.patient_id || req.user?.id,
        appointments: [
          {
            id: 'app-10000000-0000-0000-0000-000000000001',
            doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
            appointment_date: '2026-10-10',
            appointment_time: '10:00:00',
            status: 'requested',
          },
        ],
      },
    });
  }
);

/**
 * POST /api/v1/patient/appointments
 * Patient can create own appointment requests.
 */
patientRouter.post(
  '/appointments',
  requireRole('patient'),
  (req: Request, res: Response) => {
    const { doctor_id, appointment_date, appointment_time, reason } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'doctor_id, appointment_date, and appointment_time are required',
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: 'app-' + Date.now(),
        patient_id: req.user?.patient_id || req.user?.id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason: reason || 'General checkup',
        status: 'requested',
      },
    });
  }
);
