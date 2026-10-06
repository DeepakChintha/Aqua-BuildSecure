import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import * as supabaseConfig from '../config/supabase.js';
import { AppointmentService } from '../services/appointment.service.js';

describe('Phase 7 — Appointment System Unit, API & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    AppointmentService.resetStore();
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

  const sampleDoctorId = '11111111-1111-1111-1111-111111111111';

  // 1. Valid booking
  it('POST /api/v1/appointments creates a valid appointment request = ALLOW (HTTP 201)', async () => {
    mockAuthenticatedUser({
      id: 'pat-11111111-1111-1111-1111-111111111111',
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', 'Bearer mock-patient-jwt')
      .send({
        doctor_id: sampleDoctorId,
        appointment_date: '2026-11-20',
        appointment_time: '14:00:00',
        reason: 'Annual health checkup',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('requested');
    expect(res.body.data.doctor_id).toBe(sampleDoctorId);
  });

  // 2. Duplicate booking conflict
  it('Duplicate booking for same doctor, date, and time slot = DENY (HTTP 409 Conflict)', async () => {
    mockAuthenticatedUser({
      id: 'pat-11111111-1111-1111-1111-111111111111',
      email: 'patient.a@clinexa.local',
      role: 'patient',
    });

    // First booking
    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', 'Bearer mock-patient-jwt')
      .send({
        doctor_id: sampleDoctorId,
        appointment_date: '2026-11-20',
        appointment_time: '14:00:00',
      });

    // Second booking attempt on exact same slot
    const res2 = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', 'Bearer mock-patient-jwt')
      .send({
        doctor_id: sampleDoctorId,
        appointment_date: '2026-11-20',
        appointment_time: '14:00:00',
      });

    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.error.code).toBe('SLOT_ALREADY_BOOKED');
    expect(res2.body.error.message).toContain('Scheduling conflict');
  });

  // 3. Confirmation by Doctor
  it('Doctor confirms requested appointment = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'doc-10000000-0000-0000-0000-000000000001',
      email: 'doctor.jenkins@clinexa.local',
      role: 'doctor',
      doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/confirm')
      .set('Authorization', 'Bearer mock-doctor-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('confirmed');
  });

  // 4. Patient attempting to confirm appointment = DENY (HTTP 403)
  it('Patient attempting to confirm an appointment = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'pat-10000000-0000-0000-0000-000000000001',
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: 'pat-10000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/confirm')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 5. Unassigned Doctor attempting to confirm another doctor appointment = DENY (HTTP 403)
  it('Doctor confirming an appointment assigned to another doctor = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'doc-88888888-8888-8888-8888-888888888888',
      email: 'unassigned.doctor@clinexa.local',
      role: 'doctor',
      doctor_id: 'doc-88888888-8888-8888-8888-888888888888',
    });

    const res = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/confirm')
      .set('Authorization', 'Bearer mock-other-doctor-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // 6. Complete appointment workflow & invalid transition checks
  it('Full workflow: requested -> confirmed -> in_progress -> completed = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'doc-10000000-0000-0000-0000-000000000001',
      email: 'doctor.jenkins@clinexa.local',
      role: 'doctor',
      doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
    });

    // 1. Confirm
    const res1 = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/confirm')
      .set('Authorization', 'Bearer mock-doctor-jwt');
    expect(res1.body.data.status).toBe('confirmed');

    // 2. Start (in_progress)
    const res2 = await request(app)
      .patch('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer mock-doctor-jwt')
      .send({ status: 'in_progress' });
    expect(res2.body.data.status).toBe('in_progress');

    // 3. Complete
    const res3 = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/complete')
      .set('Authorization', 'Bearer mock-doctor-jwt');
    expect(res3.body.data.status).toBe('completed');
  });

  // 7. Invalid state transition rejection
  it('Invalid state transition: completed -> requested = REJECT (HTTP 400)', async () => {
    mockAuthenticatedUser({
      id: 'doc-10000000-0000-0000-0000-000000000001',
      email: 'doctor.jenkins@clinexa.local',
      role: 'doctor',
      doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
    });

    // Advance to completed first
    await request(app).post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/confirm').set('Authorization', 'Bearer mock-jwt');
    await request(app).patch('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer mock-jwt').send({ status: 'in_progress' });
    await request(app).post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/complete').set('Authorization', 'Bearer mock-jwt');

    // Attempt invalid transition back to requested
    const invalidRes = await request(app)
      .patch('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer mock-doctor-jwt')
      .send({ status: 'requested' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.success).toBe(false);
    expect(invalidRes.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  // 8. Cancellation workflow
  it('Cancellation flow: requested -> cancelled = ALLOW (HTTP 200)', async () => {
    mockAuthenticatedUser({
      id: 'pat-10000000-0000-0000-0000-000000000001',
      email: 'patient.a@clinexa.local',
      role: 'patient',
      patient_id: 'pat-10000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001/cancel')
      .set('Authorization', 'Bearer mock-patient-jwt');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('cancelled');
  });

  // 9. IDOR protection: Unrelated patient viewing another patient's appointment
  it('IDOR Security Test: Patient B accessing Patient A appointment = DENY (HTTP 403)', async () => {
    mockAuthenticatedUser({
      id: 'pat-99999999-9999-9999-9999-999999999999',
      email: 'patient.b@clinexa.local',
      role: 'patient',
      patient_id: 'pat-99999999-9999-9999-9999-999999999999',
    });

    const res = await request(app)
      .get('/api/v1/appointments/app-10000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer mock-patient-b-jwt');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
