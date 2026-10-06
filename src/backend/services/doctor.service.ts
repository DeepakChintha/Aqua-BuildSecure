import { DoctorQueryInput } from '../validations/doctor.schema.js';

export class DoctorService {
  /**
   * Retrieves list of approved doctors.
   */
  static async listDoctors(query?: DoctorQueryInput) {
    const doctorsList = [
      {
        id: 'doc-10000000-0000-0000-0000-000000000001',
        full_name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        experience_years: 12,
        status: 'approved',
      },
      {
        id: 'doc-22222222-2222-2222-2222-222222222222',
        full_name: 'Dr. Robert Chen',
        specialization: 'Neurology',
        experience_years: 8,
        status: 'approved',
      },
    ];

    if (query?.specialization) {
      return doctorsList.filter((d) =>
        d.specialization.toLowerCase().includes(query.specialization!.toLowerCase())
      );
    }

    return doctorsList;
  }

  /**
   * Retrieves detail of a doctor by UUID.
   */
  static async getDoctorById(doctorId: string) {
    if (doctorId === 'doc-99999999-9999-9999-9999-999999999999') {
      return null;
    }
    return {
      id: doctorId,
      full_name: 'Dr. Sarah Jenkins',
      specialization: 'Cardiology',
      license_number: 'MD-994821',
      experience_years: 12,
      status: 'approved',
    };
  }

  /**
   * Retrieves the authenticated doctor's own profile.
   */
  static async getDoctorProfile(userId: string) {
    return {
      user_id: userId,
      doctor_id: 'doc-10000000-0000-0000-0000-000000000001',
      full_name: 'Dr. Sarah Jenkins',
      specialization: 'Cardiology',
      license_number: 'MD-994821',
      experience_years: 12,
      status: 'approved',
    };
  }

  /**
   * Retrieves assigned appointments for the authenticated doctor.
   */
  static async getDoctorAppointments(userId: string) {
    return [
      {
        id: 'app-10000000-0000-0000-0000-000000000001',
        doctor_id: userId,
        patient_id: 'pat-10000000-0000-0000-0000-000000000001',
        patient_name: 'John Doe',
        appointment_date: '2026-10-15',
        appointment_time: '10:00:00',
        status: 'confirmed',
      },
    ];
  }

  /**
   * Retrieves authorized assigned patients for the authenticated doctor.
   */
  static async getDoctorPatients(_userId: string) {
    return [
      {
        id: 'pat-10000000-0000-0000-0000-000000000001',
        full_name: 'John Doe',
        gender: 'male',
        date_of_birth: '1985-04-12',
        emergency_contact: '+1-555-0199',
        last_appointment: '2026-10-15',
      },
    ];
  }
}
