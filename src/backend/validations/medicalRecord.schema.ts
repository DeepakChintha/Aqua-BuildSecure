import { z } from 'zod';

export const medicalRecordIdParamSchema = z.object({
  id: z.string().min(1, { message: 'Medical Record ID is required' }),
});

export const patientIdParamSchema = z.object({
  patientId: z.string().min(1, { message: 'Patient ID is required' }),
});

export const createMedicalRecordSchema = z.object({
  patient_id: z.string().min(1, { message: 'patient_id is required' }),
  doctor_id: z.string().optional(),
  appointment_id: z.string().optional(),
  diagnosis: z
    .string()
    .min(2, { message: 'diagnosis must be at least 2 characters' })
    .max(500, { message: 'diagnosis cannot exceed 500 characters' }),
  notes: z.string().max(2000, { message: 'notes cannot exceed 2000 characters' }).optional(),
  prescription: z.string().max(1000, { message: 'prescription cannot exceed 1000 characters' }).optional(),
});

export const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().min(2).max(500).optional(),
  notes: z.string().max(2000).optional(),
  prescription: z.string().max(1000).optional(),
});

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;
