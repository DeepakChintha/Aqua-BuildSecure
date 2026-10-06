import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdParamSchema,
} from '../validations/appointment.schema.js';

export class AppointmentController {
  /**
   * POST /api/v1/appointments
   * Patient creates an appointment request.
   */
  static async createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const validatedData = createAppointmentSchema.parse(req.body);
      const newAppointment = await AppointmentService.createAppointment(req.user, validatedData);

      res.status(201).json({
        success: true,
        data: newAppointment,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/v1/appointments
   * Retrieve appointments for current authenticated user (Patient/Doctor/Admin).
   */
  static async getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const appointments = await AppointmentService.getAppointments(req.user);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/appointments/:id
   * Retrieve specific appointment by ID.
   */
  static async getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const appointment = await AppointmentService.getAppointmentById(id, req.user);

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/v1/appointments/:id
   * Update appointment details/status.
   */
  static async updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const validatedBody = updateAppointmentSchema.parse(req.body);

      const targetStatus = validatedBody.status || 'requested';
      const updated = await AppointmentService.updateAppointmentStatus(id, targetStatus, req.user, validatedBody);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/v1/appointments/:id/confirm
   * Doctor/Admin confirms requested appointment.
   */
  static async confirmAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const confirmed = await AppointmentService.updateAppointmentStatus(id, 'confirmed', req.user);

      res.status(200).json({
        success: true,
        data: confirmed,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/v1/appointments/:id/cancel
   * Patient/Doctor/Admin cancels appointment.
   */
  static async cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const cancelled = await AppointmentService.updateAppointmentStatus(id, 'cancelled', req.user);

      res.status(200).json({
        success: true,
        data: cancelled,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/v1/appointments/:id/complete
   * Doctor completes in_progress appointment.
   */
  static async completeAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = appointmentIdParamSchema.parse(req.params);
      const completed = await AppointmentService.updateAppointmentStatus(id, 'completed', req.user);

      res.status(200).json({
        success: true,
        data: completed,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'BAD_REQUEST',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
}
