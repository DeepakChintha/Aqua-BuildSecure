import { appointments, doctors, labReports, medicalRecords, prescriptions, threads } from '../data'
import type { Appointment, Doctor, LabReport, MedicalRecord, Prescription } from '../types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

async function demo<T>(value: T): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 120))
  return value
}

export const authService = {
  provider: 'Supabase Auth ready',
  apiBaseUrl,
}

export const doctorService = {
  list: (): Promise<Doctor[]> => demo(doctors),
  getById: (id: string): Promise<Doctor | undefined> => demo(doctors.find((doctor) => doctor.id === id)),
}

export const appointmentService = {
  list: (): Promise<Appointment[]> => demo(appointments),
  getById: (id: string): Promise<Appointment | undefined> => demo(appointments.find((appointment) => appointment.id === id)),
}

export const medicalRecordService = { list: (): Promise<MedicalRecord[]> => demo(medicalRecords) }
export const prescriptionService = { list: (): Promise<Prescription[]> => demo(prescriptions) }
export const labReportService = { list: (): Promise<LabReport[]> => demo(labReports) }
export const messageService = { list: () => demo(threads) }
export const patientService = { profile: () => demo({ id: 'p-1042', name: 'Aarav Mehta', bloodType: 'O+', lastVisit: '28 Sep 2026' }) }
export const adminService = { metrics: () => demo({ patientGrowth: 8.6, bedOccupancy: 78, revenue: 482600 }) }
