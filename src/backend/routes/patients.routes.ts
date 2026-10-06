import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { PatientController } from '../controllers/patient.controller.js';

export const patientsRouter = Router();

// Apply authentication to all patient endpoints
patientsRouter.use(authenticate);

/**
 * GET /api/v1/patients/me
 * Patient accesses own profile.
 */
patientsRouter.get(
  '/me',
  requireRole('patient', 'admin'),
  PatientController.getMe
);

/**
 * PATCH /api/v1/patients/me
 * Patient updates own profile.
 */
patientsRouter.patch(
  '/me',
  requireRole('patient', 'admin'),
  PatientController.updateMe
);

/**
 * GET /api/v1/patients/me/appointments
 * Patient accesses own appointments.
 */
patientsRouter.get(
  '/me/appointments',
  requireRole('patient', 'admin'),
  PatientController.getMeAppointments
);

/**
 * GET /api/v1/patients/me/medical-records
 * Patient accesses own medical records.
 */
patientsRouter.get(
  '/me/medical-records',
  requireRole('patient', 'admin'),
  PatientController.getMeMedicalRecords
);
