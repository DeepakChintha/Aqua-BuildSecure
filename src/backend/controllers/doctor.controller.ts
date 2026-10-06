import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service.js';
import { doctorQuerySchema, doctorIdParamSchema } from '../validations/doctor.schema.js';

export class DoctorController {
  /**
   * GET /api/v1/doctors
   * Retrieve list of approved doctors.
   */
  static async listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = doctorQuerySchema.parse(req.query);
      const doctors = await DoctorService.listDoctors(validatedQuery);
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/doctors/:id
   * Retrieve detailed information for a specific doctor by UUID.
   */
  static async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = doctorIdParamSchema.parse(req.params);
      const doctor = await DoctorService.getDoctorById(id);

      if (!doctor) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/doctors/me
   * Retrieve current authenticated doctor's own profile.
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

      const doctorProfile = await DoctorService.getDoctorProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: doctorProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/doctors/me/appointments
   * Retrieve clinical appointments assigned to current authenticated doctor.
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

      const appointments = await DoctorService.getDoctorAppointments(req.user.id);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/doctors/me/patients
   * Retrieve authorized patients assigned to current authenticated doctor.
   */
  static async getMePatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const patients = await DoctorService.getDoctorPatients(req.user.id);
      res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (err) {
      next(err);
    }
  }
}
