import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';

describe('Phase 5 Security Tests — RBAC & Resource-Level Authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockAuthenticatedUser = (userObj: {
    id: string;
    email: string;
    role: string;
    patient_id?: string;
    doctor_id?: string;
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
              user_metadata: userObj.user_metadata || { role: userObj.role },
            },
          },
          error: null,
        }),
      },
    };
    vi.spyOn(supabaseConfig, 'getSupabaseClient').mockReturnValue(mockSupabaseClient as any);
  };

  // Test 1: Patient → own resource = ALLOW
  it('Patient → own resource = ALLOW (HTTP 200)', async () => {
    const patientId = 'pat-11111111-1111-1111-1111-111111111111';
    mockAuthenticatedUser({
      id: patientId,
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: patientId,
    });

    const res = await request(app)
      .get(`/api/v1/patient/profile/${patientId}`)
      .set('Authorization', 'Bearer mock-patient-a-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient_id).toBe(patientId);
  });

  // Test 2: Patient → another patient's resource = DENY
  it("Patient → another patient's resource = DENY (HTTP 403)", async () => {
    const patientAId = 'pat-11111111-1111-1111-1111-111111111111';
    const patientBId = 'pat-22222222-2222-2222-2222-222222222222';
    mockAuthenticatedUser({
      id: patientAId,
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: patientAId,
    });

    const res = await request(app)
      .get(`/api/v1/patient/profile/${patientBId}`)
      .set('Authorization', 'Bearer mock-patient-a-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('cannot access another patient data');
  });

  // Test 3: Patient → admin = DENY
  it('Patient → admin endpoint = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'pat-11111111-1111-1111-1111-111111111111',
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .get('/api/v1/admin/doctors')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('insufficient role permissions');
  });

  // Test 4: Doctor → admin = DENY
  it('Doctor → admin endpoint = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'doc-33333333-3333-3333-3333-333333333333',
      email: 'doctor.smith@clinexa.local',
      role: 'doctor',
      doctor_id: 'doc-33333333-3333-3333-3333-333333333333',
    });

    const res = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', 'Bearer mock-doctor-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('insufficient role permissions');
  });

  // Test 5: Unauthorized doctor → patient medical record = DENY
  it('Unauthorized doctor → patient medical record = DENY (HTTP 403)', async () => {
    const doctorId = 'doc-33333333-3333-3333-3333-333333333333';
    mockAuthenticatedUser({
      id: doctorId,
      email: 'unauthorized.doctor@clinexa.local',
      role: 'doctor',
      doctor_id: doctorId,
    });

    const res = await request(app)
      .post('/api/v1/doctor/medical-records')
      .set('Authorization', 'Bearer mock-doctor-jwt')
      .set('x-assigned-patient', 'false')
      .send({
        patient_id: 'pat-99999999-9999-9999-9999-999999999999',
        doctor_id: doctorId,
        diagnosis: 'Unauthorized record creation',
        is_assigned: false,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('not authorized for this patient medical record');
  });

  // Test 6: Admin → authorized admin resource = ALLOW
  it('Admin → authorized admin resource = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'adm-00000000-0000-0000-0000-000000000001',
      email: 'admin.super@clinexa.local',
      role: 'admin',
    });

    const res = await request(app)
      .get('/api/v1/admin/doctors')
      .set('Authorization', 'Bearer mock-admin-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.doctors).toBeDefined();
  });

  // Additional Security Test: Doctor self-approval prevention
  it('Doctor attempting self-approval = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'doc-33333333-3333-3333-3333-333333333333',
      email: 'doctor.smith@clinexa.local',
      role: 'doctor',
    });

    const res = await request(app)
      .patch('/api/v1/doctor/status')
      .set('Authorization', 'Bearer mock-doctor-jwt')
      .send({ status: 'approved' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('not permitted to approve their own status');
  });
});
