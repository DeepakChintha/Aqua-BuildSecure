import type { LucideIcon } from 'lucide-react'

export type Role = 'patient' | 'doctor' | 'admin'
export type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'available' | 'occupied' | 'maintenance'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  title?: string
  specialty?: string
  avatar?: string
}

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  section?: string
}

export interface StatMetric {
  label: string
  value: string
  change: string
  detail: string
  tone: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red'
  icon: LucideIcon
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  qualification: string
  experience: string
  rating: number
  reviews: number
  fee: string
  location: string
  availability: string
  verified: boolean
  avatar: string
  about: string
  nextSlot: string
}

export interface Appointment {
  id: string
  patient: string
  doctor: string
  specialty: string
  date: string
  time: string
  type: 'Video consultation' | 'In-clinic visit' | 'Follow-up'
  status: Status
  avatar: string
  reason: string
}

export interface MedicalRecord {
  id: string
  title: string
  doctor: string
  hospital: string
  date: string
  type: string
  note: string
  tags: string[]
}

export interface Prescription {
  id: string
  medicine: string
  dosage: string
  frequency: string
  duration: string
  doctor: string
  date: string
  status: 'Active' | 'Completed'
  instructions: string
}

export interface LabReport {
  id: string
  test: string
  laboratory: string
  date: string
  result: string
  status: 'Ready' | 'Processing' | 'Reviewed'
  patient: string
}

export interface MessageThread {
  id: string
  name: string
  role: string
  preview: string
  time: string
  unread: number
  online: boolean
  avatar: string
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'appointment' | 'prescription' | 'lab' | 'message' | 'system'
  unread: boolean
}

export interface Department {
  name: string
  head: string
  doctors: number
  patients: number
  appointments: number
  beds: number
  status: 'On track' | 'At capacity' | 'Review'
  color: string
}

export interface Bed {
  id: string
  ward: string
  floor: string
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  patient?: string
}
