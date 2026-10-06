import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service.js';
import { updatePatientProfileSchema } from '../validations/patient.schema.js';

import { recordAuditLog } from '../utils/auditLogger.js';

export class PatientController {
  /**
   * GET /api/v1/patients/me
   * Retrieve current authenticated patient's own profile.
   */
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const profile = await PatientService.getPatientProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/patients/me
   * Update current authenticated patient's own profile.
   * Ownership derived strictly from req.user.id to prevent IDOR attacks.
   */
  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const validatedBody = updatePatientProfileSchema.parse(req.body);
      const updatedProfile = await PatientService.updatePatientProfile(req.user.id, validatedBody);

      recordAuditLog({
        user_id: req.user.id,
        action: 'PROFILE_UPDATED',
        resource_type: 'patient_profile',
        resource_id: req.user.id,
        result: 'success',
        ip: req.ip || 'unknown',
        user_agent: req.get('User-Agent'),
      });

      res.status(200).json({
        success: true,
        data: updatedProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/patients/me/appointments
   * Retrieve current authenticated patient's own appointments.
   */
  static async getMeAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const appointments = await PatientService.getPatientAppointments(req.user.id);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/patients/me/medical-records
   * Retrieve current authenticated patient's own medical records.
   */
  static async getMeMedicalRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const records = await PatientService.getPatientMedicalRecords(req.user.id);
      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  }
}
