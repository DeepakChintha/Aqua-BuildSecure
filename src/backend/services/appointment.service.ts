import { CreateAppointmentInput, UpdateAppointmentInput } from '../validations/appointment.schema.js';
import { AuthUser } from '../types/express.js';
import { logger } from '../utils/logger.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export interface AppointmentRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// In-memory persistent appointment store for reliable state management & double-booking protection
const appointmentsStore: Map<string, AppointmentRecord> = new Map();

// Seed initial default appointment for testing
const initialAppId = 'app-10000000-0000-0000-0000-000000000001';
appointmentsStore.set(initialAppId, {
  id: initialAppId,
  patient_id: 'pat-10000000-0000-0000-0000-000000000001',
  doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
  appointment_date: '2026-10-15',
  appointment_time: '10:00:00',
  reason: 'General Cardiovascular Checkup',
  status: 'requested',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
});

// Allowed State Transitions Map
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  requested: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
};

export class AppointmentService {
  /**
   * Helper: Resets in-memory store for fresh isolated unit tests.
   */
  static resetStore(): void {
    appointmentsStore.clear();
    appointmentsStore.set(initialAppId, {
      id: initialAppId,
      patient_id: 'pat-10000000-0000-0000-0000-000000000001',
      doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
      appointment_date: '2026-10-15',
      appointment_time: '10:00:00',
      reason: 'General Cardiovascular Checkup',
      status: 'requested',
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-01T10:00:00Z',
    });
  }

  /**
   * Patient creates an appointment request with Double-Booking prevention.
   */
  static async createAppointment(user: AuthUser, input: CreateAppointmentInput): Promise<AppointmentRecord> {
    const patientId = user.patient_id || user.id;

    // Normalize time format to HH:mm:ss
    const normalizedTime = input.appointment_time.length === 5 ? `${input.appointment_time}:00` : input.appointment_time;

    // Check for double-booking conflict: same doctor + same date + same time slot
    for (const app of appointmentsStore.values()) {
      const appNormalizedTime = app.appointment_time.length === 5 ? `${app.appointment_time}:00` : app.appointment_time;
      if (
        app.doctor_id === input.doctor_id &&
        app.appointment_date === input.appointment_date &&
        appNormalizedTime === normalizedTime &&
        app.status !== 'cancelled'
      ) {
        logger.warn({ doctorId: input.doctor_id, date: input.appointment_date, time: normalizedTime }, 'Double booking detected');
        const conflictErr: any = new Error('Scheduling conflict: The selected doctor is already booked for this date and time slot');
        conflictErr.statusCode = 409;
        conflictErr.code = 'SLOT_ALREADY_BOOKED';
        throw conflictErr;
      }
    }

    const newAppointment: AppointmentRecord = {
      id: 'app-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      patient_id: patientId,
      doctor_id: input.doctor_id,
      appointment_date: input.appointment_date,
      appointment_time: normalizedTime,
      reason: input.reason || 'Medical consultation',
      status: 'requested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    appointmentsStore.set(newAppointment.id, newAppointment);

    recordAuditLog({
      user_id: user.id,
      action: 'APPOINTMENT_CREATED',
      resource_type: 'appointment',
      resource_id: newAppointment.id,
      result: 'success',
      metadata: { doctor_id: input.doctor_id, date: input.appointment_date },
    });

    return newAppointment;
  }

  /**
   * Retrieves list of appointments filtered by user identity and role.
   */
  static async getAppointments(user: AuthUser): Promise<AppointmentRecord[]> {
    const allApps = Array.from(appointmentsStore.values());

    if (user.role === 'admin') {
      return allApps;
    }

    if (user.role === 'doctor') {
      const doctorId = user.doctor_id || user.id;
      return allApps.filter((a) => a.doctor_id === doctorId);
    }

    // Patient role
    const patientId = user.patient_id || user.id;
    return allApps.filter((a) => a.patient_id === patientId);
  }

  /**
   * Retrieves specific appointment by ID with IDOR protection.
   */
  static async getAppointmentById(appointmentId: string, user: AuthUser): Promise<AppointmentRecord> {
    const appointment = appointmentsStore.get(appointmentId);

    if (!appointment) {
      const notFoundErr: any = new Error('Appointment not found');
      notFoundErr.statusCode = 404;
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    // IDOR Protection: Patient can only access own, Doctor can only access assigned, Admin accesses all
    if (user.role === 'patient') {
      const patientId = user.patient_id || user.id;
      if (appointment.patient_id !== patientId) {
        const forbiddenErr: any = new Error('Access denied: cannot access another patient appointment');
        forbiddenErr.statusCode = 403;
        forbiddenErr.code = 'FORBIDDEN';
        throw forbiddenErr;
      }
    } else if (user.role === 'doctor') {
      const doctorId = user.doctor_id || user.id;
      if (appointment.doctor_id !== doctorId) {
        const forbiddenErr: any = new Error('Access denied: doctor not assigned to this appointment');
        forbiddenErr.statusCode = 403;
        forbiddenErr.code = 'FORBIDDEN';
        throw forbiddenErr;
      }
    }

    return appointment;
  }

  /**
   * Updates appointment details or triggers state transition with strict workflow validation.
   */
  static async updateAppointmentStatus(
    appointmentId: string,
    targetStatus: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    user: AuthUser,
    updateFields?: UpdateAppointmentInput
  ): Promise<AppointmentRecord> {
    const appointment = await this.getAppointmentById(appointmentId, user);

    // Security Rule: Patients CANNOT confirm appointments
    if (targetStatus === 'confirmed' && user.role === 'patient') {
      const forbiddenErr: any = new Error('Access denied: Patients are not permitted to confirm appointments');
      forbiddenErr.statusCode = 403;
      forbiddenErr.code = 'FORBIDDEN';
      throw forbiddenErr;
    }

    // Security Rule: Doctors CANNOT confirm/modify appointments assigned to another doctor
    if (user.role === 'doctor') {
      const doctorId = user.doctor_id || user.id;
      if (appointment.doctor_id !== doctorId) {
        const forbiddenErr: any = new Error('Access denied: Cannot manipulate another doctor appointment');
        forbiddenErr.statusCode = 403;
        forbiddenErr.code = 'FORBIDDEN';
        throw forbiddenErr;
      }
    }

    // Workflow State Transition Validation
    if (appointment.status !== targetStatus) {
      const allowedNextStates = ALLOWED_TRANSITIONS[appointment.status] || [];
      if (!allowedNextStates.includes(targetStatus)) {
        logger.warn({ currentStatus: appointment.status, targetStatus }, 'Invalid appointment state transition attempted');
        const invalidStateErr: any = new Error(
          `Invalid state transition: cannot transition appointment from '${appointment.status}' to '${targetStatus}'`
        );
        invalidStateErr.statusCode = 400;
        invalidStateErr.code = 'INVALID_STATE_TRANSITION';
        throw invalidStateErr;
      }
    }

    // Apply updates
    appointment.status = targetStatus;
    if (updateFields?.appointment_date) appointment.appointment_date = updateFields.appointment_date;
    if (updateFields?.appointment_time) appointment.appointment_time = updateFields.appointment_time;
    if (updateFields?.reason) appointment.reason = updateFields.reason;
    appointment.updated_at = new Date().toISOString();

    appointmentsStore.set(appointment.id, appointment);

    let auditAction: string = 'APPOINTMENT_UPDATED';
    if (targetStatus === 'confirmed') auditAction = 'APPOINTMENT_CONFIRMED';
    else if (targetStatus === 'cancelled') auditAction = 'APPOINTMENT_CANCELLED';
    else if (targetStatus === 'completed') auditAction = 'APPOINTMENT_COMPLETED';

    recordAuditLog({
      user_id: user.id,
      action: auditAction,
      resource_type: 'appointment',
      resource_id: appointment.id,
      result: 'success',
      metadata: { new_status: targetStatus },
    });

    return appointment;
  }
}

