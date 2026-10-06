import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { requireApprovedDoctor } from '../middleware/doctorApproved.middleware.js';
import { AppointmentController } from '../controllers/appointment.controller.js';

export const appointmentsRouter = Router();

// Apply authentication to all appointment routes
appointmentsRouter.use(authenticate);

/**
 * POST /api/v1/appointments
 * Create appointment request.
 */
appointmentsRouter.post(
  '/',
  requireRole('patient', 'doctor', 'admin'),
  AppointmentController.createAppointment
);

/**
 * GET /api/v1/appointments
 * Get list of appointments according to role scope.
 */
appointmentsRouter.get(
  '/',
  requireRole('patient', 'doctor', 'admin'),
  AppointmentController.getAppointments
);

/**
 * GET /api/v1/appointments/:id
 * Get specific appointment by ID.
 */
appointmentsRouter.get(
  '/:id',
  requireRole('patient', 'doctor', 'admin'),
  AppointmentController.getAppointmentById
);

/**
 * PATCH /api/v1/appointments/:id
 * Update appointment status/details.
 */
appointmentsRouter.patch(
  '/:id',
  requireRole('patient', 'doctor', 'admin'),
  AppointmentController.updateAppointment
);

/**
 * POST /api/v1/appointments/:id/confirm
 * Doctor/Admin confirms requested appointment.
 */
appointmentsRouter.post(
  '/:id/confirm',
  requireRole('doctor', 'admin'),
  requireApprovedDoctor,
  AppointmentController.confirmAppointment
);

/**
 * POST /api/v1/appointments/:id/cancel
 * Cancel appointment.
 */
appointmentsRouter.post(
  '/:id/cancel',
  requireRole('patient', 'doctor', 'admin'),
  AppointmentController.cancelAppointment
);

/**
 * POST /api/v1/appointments/:id/complete
 * Doctor/Admin completes in_progress appointment.
 */
appointmentsRouter.post(
  '/:id/complete',
  requireRole('doctor', 'admin'),
  requireApprovedDoctor,
  AppointmentController.completeAppointment
);
