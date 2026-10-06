import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { requireApprovedDoctor } from '../middleware/doctorApproved.middleware.js';
import { DoctorController } from '../controllers/doctor.controller.js';

export const doctorsRouter = Router();

/**
 * GET /api/v1/doctors
 * Public list of approved doctors.
 */
doctorsRouter.get('/', DoctorController.listDoctors);

/**
 * GET /api/v1/doctors/me
 * Doctor profile endpoint (requires authentication & doctor/admin role).
 */
doctorsRouter.get(
  '/me',
  authenticate,
  requireRole('doctor', 'admin'),
  DoctorController.getMe
);

/**
 * GET /api/v1/doctors/me/appointments
 * Clinical appointments assigned to doctor. Requires approved doctor status.
 */
doctorsRouter.get(
  '/me/appointments',
  authenticate,
  requireRole('doctor', 'admin'),
  requireApprovedDoctor,
  DoctorController.getMeAppointments
);

/**
 * GET /api/v1/doctors/me/patients
 * Clinical assigned patients for doctor. Requires approved doctor status.
 */
doctorsRouter.get(
  '/me/patients',
  authenticate,
  requireRole('doctor', 'admin'),
  requireApprovedDoctor,
  DoctorController.getMePatients
);

/**
 * GET /api/v1/doctors/:id
 * Detailed doctor information by UUID.
 */
doctorsRouter.get('/:id', DoctorController.getDoctorById);
