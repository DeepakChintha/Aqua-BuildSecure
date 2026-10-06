import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';
import { MedicalRecordService } from '../services/medicalRecord.service.js';
import { getAuditLogs } from '../utils/auditLogger.js';

describe('Phase 8 — Secure Medical Record Management API & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    MedicalRecordService.resetStore();
  });

  const mockAuthenticatedUser = (userObj: {
    id: string;
    email: string;
    role: string;
    patient_id?: string;
    doctor_id?: string;
    doctor_status?: string;
    user_metadata?: Record<string, unknown>;
  }) => {
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: userObj.id,
              email: userObj.email,
              role: userObj.role,
              patient_id: userObj.patient_id,
              doctor_id: userObj.doctor_id,
              user_metadata: {
                role: userObj.role,
                doctor_status: userObj.doctor_status || 'approved',
                ...userObj.user_metadata,
              },
            },
          },
          error: null,
        }),
      },
    };
    vi.spyOn(supabaseConfig, 'getSupabaseClient').mockReturnValue(mockSupabaseClient as any);
  };

  const samplePatA = 'pat-10000000-0000-0000-0000-000000000001';
  const samplePatB = 'pat-22222222-2222-2222-2222-222222222222';
  const sampleDocA = 'doc-10000000-0000-0000-0000-000000000001';
  const sampleRecordId = 'rec-10000000-0000-0000-0000-000000000001';

  // 1. Patient A -> own record = ALLOW (200)
  it('Patient A -> own medical record = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: samplePatA,
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: samplePatA,
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/patient/${samplePatA}`)
      .set('Authorization', 'Bearer mock-patient-a-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const logs = getAuditLogs();
    const viewedLog = logs.find((l) => l.action === 'MEDICAL_RECORD_VIEWED' && l.userId === samplePatA);
    expect(viewedLog).toBeDefined();
  });

  it('Patient A -> own specific medical record by ID = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: samplePatA,
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: samplePatA,
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/${sampleRecordId}`)
      .set('Authorization', 'Bearer mock-patient-a-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(sampleRecordId);
  });

  // 2. Patient A -> Patient B = DENY (403)
  it('Patient A -> Patient B medical record = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: samplePatA,
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: samplePatA,
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/patient/${samplePatB}`)
      .set('Authorization', 'Bearer mock-patient-a-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');

    const logs = getAuditLogs();
    const deniedLog = logs.find((l) => l.action === 'UNAUTHORIZED_MEDICAL_RECORD_ACCESS' && l.userId === samplePatA);
    expect(deniedLog).toBeDefined();
  });

  // 3. Doctor A -> authorized patient = ALLOW (200)
  it('Doctor A -> authorized assigned patient = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: sampleDocA,
      email: 'doctor.a@clinexa.local',
      role: 'doctor',
      doctor_id: sampleDocA,
      doctor_status: 'approved',
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/patient/${samplePatA}`)
      .set('Authorization', 'Bearer mock-doctor-a-jwt')
      .set('x-doctor-status', 'approved');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 4. Doctor A -> unauthorized patient = DENY (403)
  it('Doctor A -> unauthorized unassigned patient = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: sampleDocA,
      email: 'doctor.a@clinexa.local',
      role: 'doctor',
      doctor_id: sampleDocA,
      doctor_status: 'approved',
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/patient/${samplePatB}`)
      .set('Authorization', 'Bearer mock-doctor-a-jwt')
      .set('x-doctor-status', 'approved');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('not authorized for this patient medical records');
  });

  // 5. Doctor A -> arbitrary record ID = DENY (403)
  it('Doctor A -> arbitrary non-existent/unauthorized record ID = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: sampleDocA,
      email: 'doctor.a@clinexa.local',
      role: 'doctor',
      doctor_id: sampleDocA,
    });

    const res = await request(app)
      .get('/api/v1/medical-records/rec-arbitrary-unauthorized-999')
      .set('Authorization', 'Bearer mock-doctor-a-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // 6. Suspended doctor -> medical records = DENY (403)
  it('Suspended doctor -> medical records = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: sampleDocA,
      email: 'suspended.doctor@clinexa.local',
      role: 'doctor',
      doctor_id: sampleDocA,
      doctor_status: 'suspended',
    });

    const res = await request(app)
      .get(`/api/v1/medical-records/patient/${samplePatA}`)
      .set('Authorization', 'Bearer mock-suspended-doctor-jwt')
      .set('x-doctor-status', 'suspended');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('suspended');
  });

  // 7. Patient attempting to create/modify clinical record = DENY (403)
  it('Patient attempting to create clinical medical record = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: samplePatA,
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .post('/api/v1/medical-records')
      .set('Authorization', 'Bearer mock-patient-a-jwt')
      .send({
        patient_id: samplePatA,
        diagnosis: 'Self-diagnosed Condition',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // 8. Authorized Doctor creates and updates medical record = ALLOW (201, 200)
  it('Authorized Approved Doctor creates and updates medical record = ALLOW (HTTP 201 & 200)', async () => {
    mockAuthenticatedUser({
      id: sampleDocA,
      email: 'doctor.a@clinexa.local',
      role: 'doctor',
      doctor_id: sampleDocA,
      doctor_status: 'approved',
    });

    // Create record
    const createRes = await request(app)
      .post('/api/v1/medical-records')
      .set('Authorization', 'Bearer mock-doctor-a-jwt')
      .set('x-doctor-status', 'approved')
      .send({
        patient_id: samplePatA,
        diagnosis: 'Routine Followup Evaluation (Synthetic)',
        notes: 'Stable condition.',
        prescription: 'Aspirin 81mg daily',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const createdRecordId = createRes.body.data.id;

    // Update record
    const updateRes = await request(app)
      .patch(`/api/v1/medical-records/${createdRecordId}`)
      .set('Authorization', 'Bearer mock-doctor-a-jwt')
      .set('x-doctor-status', 'approved')
      .send({
        notes: 'Updated followup: Patient in excellent health.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.notes).toContain('excellent health');
  });
});
