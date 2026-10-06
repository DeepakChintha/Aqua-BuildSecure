import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';

describe('Phase 6 — Patient & Doctor Modules API & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  // --- PATIENT APIs ---

  it('GET /api/v1/patients/me derives identity strictly from token = ALLOW (HTTP 200)', async () => {
    const patientId = 'pat-11111111-1111-1111-1111-111111111111';
    mockAuthenticatedUser({
      id: patientId,
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .get('/api/v1/patients/me')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe(patientId);
  });

  it('PATCH /api/v1/patients/me updates profile and validates payload with Zod (HTTP 200)', async () => {
    const patientId = 'pat-11111111-1111-1111-1111-111111111111';
    mockAuthenticatedUser({
      id: patientId,
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .patch('/api/v1/patients/me')
      .set('Authorization', 'Bearer mock-patient-jwt')
      .send({
        full_name: 'Updated Patient Name',
        phone: '+1555019922',
        gender: 'male',
        date_of_birth: '1992-08-20',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.full_name).toBe('Updated Patient Name');
  });

  it('GET /api/v1/patients/me/appointments returns patient own appointments (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'pat-11111111-1111-1111-1111-111111111111',
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .get('/api/v1/patients/me/appointments')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/patients/me/medical-records returns patient own medical records (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'pat-11111111-1111-1111-1111-111111111111',
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .get('/api/v1/patients/me/medical-records')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // --- DOCTOR APIs & STATUS ENFORCEMENT ---

  it('GET /api/v1/doctors returns public list of approved doctors (HTTP 200)', async () => {
    const res = await request(app).get('/api/v1/doctors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/doctors/:id validates UUID and returns doctor details (HTTP 200)', async () => {
    const validDoctorUuid = '11111111-1111-1111-1111-111111111111';
    const res = await request(app).get(`/api/v1/doctors/${validDoctorUuid}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(validDoctorUuid);
  });

  it('GET /api/v1/doctors/invalid-uuid returns Zod validation error (HTTP 500/400)', async () => {
    const res = await request(app).get('/api/v1/doctors/not-a-valid-uuid');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('Pending doctor attempting clinical operation = DENY (HTTP 403)', async () => {
    const doctorId = 'doc-44444444-4444-4444-4444-444444444444';
    mockAuthenticatedUser({
      id: doctorId,
      email: 'pending.doctor@clinexa.local',
      role: 'doctor',
      doctor_status: 'pending',
    });

    const res = await request(app)
      .get('/api/v1/doctors/me/appointments')
      .set('Authorization', 'Bearer mock-pending-doctor-jwt')
      .set('x-doctor-status', 'pending');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('pending approval');
  });

  it('Suspended doctor attempting clinical operation = DENY (HTTP 403)', async () => {
    const doctorId = 'doc-55555555-5555-5555-5555-555555555555';
    mockAuthenticatedUser({
      id: doctorId,
      email: 'suspended.doctor@clinexa.local',
      role: 'doctor',
      doctor_status: 'suspended',
    });

    const res = await request(app)
      .get('/api/v1/doctors/me/patients')
      .set('Authorization', 'Bearer mock-suspended-doctor-jwt')
      .set('x-doctor-status', 'suspended');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('suspended');
  });

  // --- IDOR & SECURITY TESTS ---

  it('IDOR Security Test: Patient A attempting to access Patient B resource = DENY (HTTP 403)', async () => {
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
  });

  it('IDOR Security Test: Doctor attempting to access unauthorized patient = DENY (HTTP 403)', async () => {
    const doctorId = 'doc-33333333-3333-3333-3333-333333333333';

    mockAuthenticatedUser({
      id: doctorId,
      email: 'doctor.smith@clinexa.local',
      role: 'doctor',
      doctor_id: doctorId,
    });

    const res = await request(app)
      .get('/api/v1/doctor/medical-records/rec-unauthorized-999')
      .set('Authorization', 'Bearer mock-doctor-jwt')
      .set('x-assigned-patient', 'false');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
