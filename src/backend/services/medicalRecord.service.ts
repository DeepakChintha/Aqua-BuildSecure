import { CreateMedicalRecordInput, UpdateMedicalRecordInput } from '../validations/medicalRecord.schema.js';
import { AuthUser } from '../types/express.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export interface MedicalRecordItem {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
}

// Stateful synthetic medical records repository
const medicalRecordsStore: Map<string, MedicalRecordItem> = new Map();

// Sample authorized relationship mappings: doctorId -> Set of authorized patientIds
const doctorPatientRelationships: Map<string, Set<string>> = new Map();

// Seed initial synthetic medical records and relationship mappings
const samplePatA = 'pat-10000000-0000-0000-0000-000000000001';
const sampleDocA = 'doc-10000000-0000-0000-0000-000000000001';

doctorPatientRelationships.set(sampleDocA, new Set([samplePatA]));

const initialRecordId = 'rec-10000000-0000-0000-0000-000000000001';
medicalRecordsStore.set(initialRecordId, {
  id: initialRecordId,
  patient_id: samplePatA,
  doctor_id: sampleDocA,
  appointment_id: 'app-10000000-0000-0000-0000-000000000001',
  diagnosis: 'Essential Hypertension (Synthetic Data)',
  notes: 'Patient reports well-managed blood pressure. Continue lifestyle modifications.',
  prescription: 'Lisinopril 10mg once daily',
  created_at: '2026-09-15T10:00:00Z',
  updated_at: '2026-09-15T10:00:00Z',
});

export class MedicalRecordService {
  /**
   * Resets medical records store for test isolation.
   */
  static resetStore(): void {
    medicalRecordsStore.clear();
    doctorPatientRelationships.clear();
    doctorPatientRelationships.set(sampleDocA, new Set([samplePatA]));

    medicalRecordsStore.set(initialRecordId, {
      id: initialRecordId,
      patient_id: samplePatA,
      doctor_id: sampleDocA,
      appointment_id: 'app-10000000-0000-0000-0000-000000000001',
      diagnosis: 'Essential Hypertension (Synthetic Data)',
      notes: 'Patient reports well-managed blood pressure. Continue lifestyle modifications.',
      prescription: 'Lisinopril 10mg once daily',
      created_at: '2026-09-15T10:00:00Z',
      updated_at: '2026-09-15T10:00:00Z',
    });
  }

  /**
   * Helper to verify if doctor has an authorized clinical relationship with patient.
   */
  private static hasDoctorPatientRelationship(doctorId: string, patientId: string): boolean {
    const assignedPatients = doctorPatientRelationships.get(doctorId);
    return assignedPatients ? assignedPatients.has(patientId) : false;
  }

  /**
   * GET /api/v1/medical-records/:patientId (or query by patientId)
   */
  static async getMedicalRecordsByPatient(
    targetPatientId: string,
    user: AuthUser,
    doctorStatus?: string,
    adminReason?: string
  ): Promise<MedicalRecordItem[]> {
    // 1. Patient Access
    if (user.role === 'patient') {
      const userPatientId = user.patient_id || user.id;
      if (targetPatientId !== userPatientId) {
        recordAuditLog({
          action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
          userId: user.id,
          resourceType: 'medical_records',
          result: 'denied',
          metadata: { targetPatientId, reason: 'Patient attempted to view another patient records' },
        });
        const err: any = new Error('Access denied: cannot access another patient medical records');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      recordAuditLog({
        action: 'MEDICAL_RECORD_VIEWED',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'success',
        metadata: { patientId: targetPatientId },
      });

      return Array.from(medicalRecordsStore.values()).filter((r) => r.patient_id === targetPatientId);
    }

    // 2. Doctor Access
    if (user.role === 'doctor') {
      const doctorId = user.doctor_id || user.id;

      // Status check: pending or suspended doctors are denied
      if (doctorStatus === 'pending' || doctorStatus === 'suspended') {
        recordAuditLog({
          action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
          userId: user.id,
          resourceType: 'medical_records',
          result: 'denied',
          metadata: { doctorStatus, reason: 'Doctor account status not approved' },
        });
        const err: any = new Error(`Access denied: Doctor account status is ${doctorStatus}`);
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      // Check legitimate doctor-patient relationship
      if (!this.hasDoctorPatientRelationship(doctorId, targetPatientId)) {
        recordAuditLog({
          action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
          userId: user.id,
          resourceType: 'medical_records',
          result: 'denied',
          metadata: { doctorId, targetPatientId, reason: 'Doctor not assigned to patient' },
        });
        const err: any = new Error('Access denied: doctor is not authorized for this patient medical records');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      recordAuditLog({
        action: 'MEDICAL_RECORD_VIEWED',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'success',
        metadata: { doctorId, patientId: targetPatientId },
      });

      return Array.from(medicalRecordsStore.values()).filter((r) => r.patient_id === targetPatientId);
    }

    // 3. Admin Access (requires explicit administrative audit reason)
    if (user.role === 'admin') {
      if (!adminReason) {
        recordAuditLog({
          action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
          userId: user.id,
          resourceType: 'medical_records',
          result: 'denied',
          metadata: { reason: 'Admin access missing explicit administrative audit reason header' },
        });
        const err: any = new Error('Access denied: Administrative access to clinical records requires explicit audit justification header (x-admin-reason)');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      recordAuditLog({
        action: 'MEDICAL_RECORD_VIEWED',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'success',
        metadata: { adminUserId: user.id, adminReason, targetPatientId },
      });

      return Array.from(medicalRecordsStore.values()).filter((r) => r.patient_id === targetPatientId);
    }

    const err: any = new Error('Access denied: insufficient permissions');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  /**
   * GET /api/v1/medical-records/:id
   */
  static async getMedicalRecordById(
    recordId: string,
    user: AuthUser,
    doctorStatus?: string,
    adminReason?: string
  ): Promise<MedicalRecordItem> {
    const record = medicalRecordsStore.get(recordId);

    if (!record) {
      recordAuditLog({
        action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        userId: user.id,
        resourceId: recordId,
        resourceType: 'medical_records',
        result: 'denied',
        metadata: { reason: 'Record ID not found' },
      });
      const err: any = new Error('Access denied: medical record not found or access unauthorized');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Reuse relationship verification logic
    await this.getMedicalRecordsByPatient(record.patient_id, user, doctorStatus, adminReason);
    return record;
  }

  /**
   * POST /api/v1/medical-records
   */
  static async createMedicalRecord(
    user: AuthUser,
    input: CreateMedicalRecordInput,
    doctorStatus?: string
  ): Promise<MedicalRecordItem> {
    // Security: Patient cannot modify/create clinical records
    if (user.role === 'patient') {
      recordAuditLog({
        action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'denied',
        metadata: { reason: 'Patient attempted to create clinical record' },
      });
      const err: any = new Error('Access denied: Patients cannot create clinical medical records');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const doctorId = user.doctor_id || user.id;

    // Doctor status check
    if (doctorStatus === 'pending' || doctorStatus === 'suspended') {
      recordAuditLog({
        action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'denied',
        metadata: { doctorStatus, reason: 'Doctor account status not approved' },
      });
      const err: any = new Error(`Access denied: Doctor account status is ${doctorStatus}`);
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Check relationship
    if (user.role === 'doctor' && !this.hasDoctorPatientRelationship(doctorId, input.patient_id)) {
      recordAuditLog({
        action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        userId: user.id,
        resourceType: 'medical_records',
        result: 'denied',
        metadata: { doctorId, targetPatientId: input.patient_id, reason: 'Doctor not assigned to patient' },
      });
      const err: any = new Error('Access denied: Doctor is not authorized for this patient medical record');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const newRecord: MedicalRecordItem = {
      id: 'rec-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      patient_id: input.patient_id,
      doctor_id: doctorId,
      appointment_id: input.appointment_id,
      diagnosis: input.diagnosis,
      notes: input.notes,
      prescription: input.prescription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    medicalRecordsStore.set(newRecord.id, newRecord);

    recordAuditLog({
      action: 'MEDICAL_RECORD_CREATED',
      userId: user.id,
      resourceType: 'medical_records',
      resourceId: newRecord.id,
      result: 'success',
      metadata: { patientId: input.patient_id, doctorId },
    });

    return newRecord;
  }

  /**
   * PATCH /api/v1/medical-records/:id
   */
  static async updateMedicalRecord(
    recordId: string,
    user: AuthUser,
    input: UpdateMedicalRecordInput,
    doctorStatus?: string
  ): Promise<MedicalRecordItem> {
    // Patients cannot modify records
    if (user.role === 'patient') {
      recordAuditLog({
        action: 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS',
        userId: user.id,
        resourceId: recordId,
        resourceType: 'medical_records',
        result: 'denied',
        metadata: { reason: 'Patient attempted to modify clinical record' },
      });
      const err: any = new Error('Access denied: Patients cannot modify clinical medical records');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const record = await this.getMedicalRecordById(recordId, user, doctorStatus);

    if (input.diagnosis) record.diagnosis = input.diagnosis;
    if (input.notes) record.notes = input.notes;
    if (input.prescription) record.prescription = input.prescription;
    record.updated_at = new Date().toISOString();

    medicalRecordsStore.set(record.id, record);

    recordAuditLog({
      action: 'MEDICAL_RECORD_UPDATED',
      userId: user.id,
      resourceType: 'medical_records',
      resourceId: record.id,
      result: 'success',
      metadata: { recordId: record.id },
    });

    return record;
  }
}
