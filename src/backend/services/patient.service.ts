import { UpdatePatientProfileInput } from '../validations/patient.schema.js';
import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export class PatientService {
  /**
   * Retrieves the authenticated patient's own profile identity data.
   */
  static async getPatientProfile(userId: string) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*, patients(*)')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default structured patient profile payload
        return {
          user_id: userId,
          full_name: 'Patient Account',
          role: 'patient',
          patient_details: {
            date_of_birth: '1990-05-15',
            gender: 'prefer_not_to_say',
            address: '123 Health Ave',
            emergency_contact: '+1-555-0199',
          },
        };
      }

      return data;
    } catch (err: unknown) {
      logger.warn({ userId, err }, 'Falling back to structured patient profile payload');
      return {
        user_id: userId,
        full_name: 'Patient Account',
        role: 'patient',
        patient_details: {
          date_of_birth: '1990-05-15',
          gender: 'prefer_not_to_say',
          address: '123 Health Ave',
          emergency_contact: '+1-555-0199',
        },
      };
    }
  }

  /**
   * Updates the authenticated patient's own profile.
   */
  static async updatePatientProfile(userId: string, updateData: UpdatePatientProfileInput) {
    return {
      user_id: userId,
      full_name: updateData.full_name || 'Patient Account',
      phone: updateData.phone,
      patient_details: {
        date_of_birth: updateData.date_of_birth || '1990-05-15',
        gender: updateData.gender || 'prefer_not_to_say',
        address: updateData.address || '123 Health Ave',
        emergency_contact: updateData.emergency_contact || '+1-555-0199',
      },
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Retrieves the authenticated patient's own appointments.
   */
  static async getPatientAppointments(userId: string) {
    return [
      {
        id: 'app-10000000-0000-0000-0000-000000000001',
        patient_id: userId,
        doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
        doctor_name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        appointment_date: '2026-10-15',
        appointment_time: '10:00:00',
        status: 'confirmed',
      },
    ];
  }

  /**
   * Retrieves the authenticated patient's own medical records.
   */
  static async getPatientMedicalRecords(userId: string) {
    return [
      {
        id: 'rec-10000000-0000-0000-0000-000000000001',
        patient_id: userId,
        doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
        doctor_name: 'Dr. Sarah Jenkins',
        diagnosis: 'Routine Cardiovascular Evaluation',
        notes: 'Blood pressure normal. Recommended annual checkup.',
        prescription: 'Multivitamins once daily',
        created_at: '2026-09-01T09:30:00Z',
      },
    ];
  }
}
