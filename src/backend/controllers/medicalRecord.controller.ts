import { Request, Response, NextFunction } from 'express';
import { MedicalRecordService } from '../services/medicalRecord.service.js';
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  patientIdParamSchema,
  medicalRecordIdParamSchema,
} from '../validations/medicalRecord.schema.js';

export class MedicalRecordController {
  /**
   * Helper to extract doctor status override and admin audit reason from headers.
   */
  private static getContext(req: Request) {
    const doctorStatus =
      (req.headers['x-doctor-status'] as string) ||
      (req.user?.user_metadata?.doctor_status as string) ||
      'approved';
    const adminReason = req.headers['x-admin-reason'] as string | undefined;

    return { doctorStatus, adminReason };
  }

  /**
   * GET /api/v1/medical-records/:patientId
   */
  static async getPatientMedicalRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { patientId } = patientIdParamSchema.parse(req.params);
      const { doctorStatus, adminReason } = MedicalRecordController.getContext(req);

      const records = await MedicalRecordService.getMedicalRecordsByPatient(
        patientId,
        req.user,
        doctorStatus,
        adminReason
      );

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'FORBIDDEN',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/v1/medical-records/:id (Record detail by ID)
   */
  static async getMedicalRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = medicalRecordIdParamSchema.parse(req.params);
      const { doctorStatus, adminReason } = MedicalRecordController.getContext(req);

      const record = await MedicalRecordService.getMedicalRecordById(id, req.user, doctorStatus, adminReason);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'FORBIDDEN',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * POST /api/v1/medical-records
   */
  static async createMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const validatedInput = createMedicalRecordSchema.parse(req.body);
      const { doctorStatus } = MedicalRecordController.getContext(req);

      const newRecord = await MedicalRecordService.createMedicalRecord(req.user, validatedInput, doctorStatus);

      res.status(201).json({
        success: true,
        data: newRecord,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'FORBIDDEN',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/v1/medical-records/:id
   */
  static async updateMedicalRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = medicalRecordIdParamSchema.parse(req.params);
      const validatedInput = updateMedicalRecordSchema.parse(req.body);
      const { doctorStatus } = MedicalRecordController.getContext(req);

      const updated = await MedicalRecordService.updateMedicalRecord(id, req.user, validatedInput, doctorStatus);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code || 'FORBIDDEN',
            message: err.message,
          },
        });
        return;
      }
      next(err);
    }
  }
}
