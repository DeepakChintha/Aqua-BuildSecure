import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { MedicalRecordController } from '../controllers/medicalRecord.controller.js';

export const medicalRecordsRouter = Router();

// Apply authentication to all medical record routes
medicalRecordsRouter.use(authenticate);

/**
 * POST /api/v1/medical-records
 * Create a new clinical medical record (Authorized Doctor only).
 */
medicalRecordsRouter.post('/', MedicalRecordController.createMedicalRecord);

/**
 * GET /api/v1/medical-records/patient/:patientId
 * Get medical records for a patient.
 */
medicalRecordsRouter.get('/patient/:patientId', MedicalRecordController.getPatientMedicalRecords);

/**
 * GET /api/v1/medical-records/:id
 * Get specific medical record by ID or patient ID.
 */
medicalRecordsRouter.get('/:id', MedicalRecordController.getMedicalRecordById);

/**
 * PATCH /api/v1/medical-records/:id
 * Update an existing clinical medical record (Authorized Doctor only).
 */
medicalRecordsRouter.patch('/:id', MedicalRecordController.updateMedicalRecord);
