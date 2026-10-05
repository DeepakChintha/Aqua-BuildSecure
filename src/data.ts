import {
  Activity,
  BadgeDollarSign,
  BedDouble,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  FileHeart,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Pill,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Timer,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import type { Appointment, Bed, Department, Doctor, LabReport, MedicalRecord, MessageThread, NavItem, NotificationItem, Prescription, Role, StatMetric, User } from './types'

export const demoUsers: Record<Role, User> = {
  patient: { id: 'p-1042', name: 'Aarav Mehta', email: 'aarav@medidesk.demo', role: 'patient', title: 'Patient', avatar: 'https://i.pravatar.cc/150?img=12' },
  doctor: { id: 'd-209', name: 'Dr. Sarah Wilson', email: 'sarah@medidesk.demo', role: 'doctor', title: 'Cardiologist', specialty: 'Cardiology', avatar: 'https://i.pravatar.cc/150?img=47' },
  admin: { id: 'a-001', name: 'Maya Chen', email: 'maya@medidesk.demo', role: 'admin', title: 'Hospital Administrator', avatar: 'https://i.pravatar.cc/150?img=32' },
}

export const roleNav: Record<Role, NavItem[]> = {
  patient: [
    { label: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard, section: 'Workspace' },
    { label: 'Find doctors', path: '/patient/doctors', icon: Search, section: 'Workspace' },
    { label: 'Appointments', path: '/patient/appointments', icon: CalendarDays, section: 'Workspace' },
    { label: 'Medical records', path: '/patient/medical-records', icon: FileHeart, section: 'My health' },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: Pill, section: 'My health' },
    { label: 'Lab reports', path: '/patient/lab-reports', icon: ClipboardList, section: 'My health' },
    { label: 'Health overview', path: '/patient/health', icon: HeartPulse, section: 'My health' },
    { label: 'Messages', path: '/patient/messages', icon: MessageCircle, section: 'Connect' },
    { label: 'Notifications', path: '/patient/notifications', icon: Bell, section: 'Connect' },
    { label: 'Settings', path: '/patient/settings', icon: Settings, section: 'Account' },
  ],
  doctor: [
    { label: 'Overview', path: '/doctor/dashboard', icon: LayoutDashboard, section: 'Workspace' },
    { label: 'Appointments', path: '/doctor/appointments', icon: CalendarDays, section: 'Workspace' },
    { label: 'My patients', path: '/doctor/patients', icon: UsersRound, section: 'Workspace' },
    { label: 'Available timings', path: '/doctor/available-timings', icon: Timer, section: 'Practice' },
    { label: 'Medical records', path: '/doctor/medical-records', icon: FileHeart, section: 'Practice' },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill, section: 'Practice' },
    { label: 'Lab reports', path: '/doctor/lab-reports', icon: ClipboardList, section: 'Practice' },
    { label: 'Messages', path: '/doctor/messages', icon: MessageCircle, section: 'Connect' },
    { label: 'Reviews', path: '/doctor/reviews', icon: ShieldCheck, section: 'Connect' },
    { label: 'Earnings', path: '/doctor/earnings', icon: WalletCards, section: 'Account' },
    { label: 'Settings', path: '/doctor/settings', icon: Settings, section: 'Account' },
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, section: 'Workspace' },
    { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope, section: 'People' },
    { label: 'Patients', path: '/admin/patients', icon: UsersRound, section: 'People' },
    { label: 'Staff', path: '/admin/staff', icon: UserRound, section: 'People' },
    { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays, section: 'Operations' },
    { label: 'Hospital', path: '/admin/hospital', icon: Building2, section: 'Operations' },
    { label: 'Departments', path: '/admin/departments', icon: BookOpen, section: 'Operations' },
    { label: 'Beds', path: '/admin/beds', icon: BedDouble, section: 'Operations' },
    { label: 'Revenue', path: '/admin/revenue', icon: BadgeDollarSign, section: 'Insights' },
    { label: 'Analytics', path: '/admin/analytics', icon: Activity, section: 'Insights' },
    { label: 'Reports', path: '/admin/reports', icon: FileBarChart, section: 'Insights' },
    { label: 'Messages', path: '/admin/messages', icon: MessageCircle, section: 'Connect' },
    { label: 'Settings', path: '/admin/settings', icon: Settings, section: 'Account' },
  ],
}

export const doctors: Doctor[] = [
  { id: 'dr-1', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', qualification: 'MD, FACC', experience: '14 years', rating: 4.9, reviews: 182, fee: '$90', location: 'Northstar Medical Center', availability: 'Available today', verified: true, avatar: 'https://i.pravatar.cc/150?img=47', about: 'Dr. Wilson helps patients build practical heart-health routines with evidence-based care and clear follow-ups.', nextSlot: 'Today · 4:30 PM' },
  { id: 'dr-2', name: 'Dr. Michael Chen', specialty: 'Neurology', qualification: 'MD, PhD', experience: '11 years', rating: 4.8, reviews: 146, fee: '$110', location: 'Harborview Clinic', availability: 'Tomorrow', verified: true, avatar: 'https://i.pravatar.cc/150?img=11', about: 'A patient-first neurologist specializing in migraine care, sleep health, and long-term wellness planning.', nextSlot: 'Tomorrow · 9:00 AM' },
  { id: 'dr-3', name: 'Dr. Emily Patel', specialty: 'Dermatology', qualification: 'MBBS, DDVL', experience: '9 years', rating: 4.7, reviews: 98, fee: '$75', location: 'Lighthouse Health', availability: 'Available today', verified: true, avatar: 'https://i.pravatar.cc/150?img=44', about: 'Dr. Patel combines clinical precision with approachable skin-health education for every age.', nextSlot: 'Today · 6:00 PM' },
  { id: 'dr-4', name: 'Dr. James Okafor', specialty: 'Orthopedics', qualification: 'MS, FRCS', experience: '18 years', rating: 4.9, reviews: 212, fee: '$120', location: 'Northstar Medical Center', availability: 'Thu, 10 Oct', verified: true, avatar: 'https://i.pravatar.cc/150?img=68', about: 'Orthopedic surgeon focused on mobility, injury recovery, and thoughtful treatment planning.', nextSlot: 'Thu · 11:30 AM' },
]

export const appointments: Appointment[] = [
  { id: 'APT-20814', patient: 'Aarav Mehta', doctor: 'Dr. Sarah Wilson', specialty: 'Cardiology', date: 'Tue, 08 Oct 2026', time: '4:30 PM', type: 'Video consultation', status: 'confirmed', avatar: 'https://i.pravatar.cc/150?img=12', reason: 'Quarterly heart health review' },
  { id: 'APT-20809', patient: 'Maya Thompson', doctor: 'Dr. Sarah Wilson', specialty: 'Cardiology', date: 'Tue, 08 Oct 2026', time: '5:15 PM', type: 'In-clinic visit', status: 'pending', avatar: 'https://i.pravatar.cc/150?img=5', reason: 'Follow-up after lab review' },
  { id: 'APT-20794', patient: 'Lucas Martin', doctor: 'Dr. Michael Chen', specialty: 'Neurology', date: 'Mon, 07 Oct 2026', time: '2:00 PM', type: 'Follow-up', status: 'completed', avatar: 'https://i.pravatar.cc/150?img=14', reason: 'Migraine care plan' },
  { id: 'APT-20771', patient: 'Nora Adams', doctor: 'Dr. Sarah Wilson', specialty: 'Cardiology', date: 'Fri, 04 Oct 2026', time: '11:00 AM', type: 'In-clinic visit', status: 'cancelled', avatar: 'https://i.pravatar.cc/150?img=25', reason: 'Medication review' },
]

export const medicalRecords: MedicalRecord[] = [
  { id: 'MR-01', title: 'Annual wellness review', doctor: 'Dr. Sarah Wilson', hospital: 'Northstar Medical Center', date: '28 Sep 2026', type: 'Consultation', note: 'Routine review with vitals and lifestyle follow-up recorded.', tags: ['Vitals', 'Follow-up'] },
  { id: 'MR-02', title: 'Blood pressure monitoring', doctor: 'Dr. Sarah Wilson', hospital: 'Northstar Medical Center', date: '12 Aug 2026', type: 'Monitoring', note: 'Home readings reviewed and next check-in scheduled.', tags: ['Blood pressure'] },
  { id: 'MR-03', title: 'Preventive care visit', doctor: 'Dr. Michael Chen', hospital: 'Harborview Clinic', date: '02 Jun 2026', type: 'Consultation', note: 'Preventive care plan updated with patient goals.', tags: ['Preventive care'] },
]

export const prescriptions: Prescription[] = [
  { id: 'RX-8042', medicine: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Sarah Wilson', date: '28 Sep 2026', status: 'Active', instructions: 'Take in the evening with water.' },
  { id: 'RX-8011', medicine: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', duration: '60 days', doctor: 'Dr. Sarah Wilson', date: '12 Aug 2026', status: 'Active', instructions: 'Take with a meal.' },
  { id: 'RX-7934', medicine: 'Magnesium glycinate', dosage: '200 mg', frequency: 'Once nightly', duration: '30 days', doctor: 'Dr. Michael Chen', date: '02 Jun 2026', status: 'Completed', instructions: 'Take before bedtime.' },
]

export const labReports: LabReport[] = [
  { id: 'LAB-1148', test: 'Comprehensive metabolic panel', laboratory: 'Northstar Labs', date: '28 Sep 2026', result: 'Within range', status: 'Reviewed', patient: 'Aarav Mehta' },
  { id: 'LAB-1142', test: 'Lipid profile', laboratory: 'Northstar Labs', date: '28 Sep 2026', result: 'Ready to view', status: 'Ready', patient: 'Aarav Mehta' },
  { id: 'LAB-1109', test: 'Vitamin D', laboratory: 'Harborview Diagnostics', date: '08 Aug 2026', result: 'Reviewed', status: 'Reviewed', patient: 'Aarav Mehta' },
]

export const threads: MessageThread[] = [
  { id: 't-1', name: 'Dr. Sarah Wilson', role: 'Cardiologist', preview: 'I have added the follow-up notes…', time: '10:42 AM', unread: 2, online: true, avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 't-2', name: 'Northstar Care Team', role: 'Care coordinator', preview: 'Your appointment is confirmed.', time: 'Yesterday', unread: 0, online: false, avatar: 'https://i.pravatar.cc/150?img=49' },
  { id: 't-3', name: 'Dr. Michael Chen', role: 'Neurologist', preview: 'How have you been feeling this week?', time: 'Mon', unread: 0, online: true, avatar: 'https://i.pravatar.cc/150?img=11' },
]

export const notifications: NotificationItem[] = [
  { id: 'n-1', title: 'Appointment confirmed', description: 'Your video consultation with Dr. Wilson is confirmed for Tue, 08 Oct at 4:30 PM.', time: '12 min ago', type: 'appointment', unread: true },
  { id: 'n-2', title: 'New lab report available', description: 'Your lipid profile report is ready to review.', time: '2 hours ago', type: 'lab', unread: true },
  { id: 'n-3', title: 'Prescription updated', description: 'Dr. Wilson added a new instruction to Atorvastatin.', time: 'Yesterday', type: 'prescription', unread: false },
  { id: 'n-4', title: 'Message from Dr. Chen', description: 'How have you been feeling this week?', time: 'Mon', type: 'message', unread: false },
]

export const departments: Department[] = [
  { name: 'Cardiology', head: 'Dr. Sarah Wilson', doctors: 18, patients: 224, appointments: 48, beds: 24, status: 'On track', color: '#1677FF' },
  { name: 'Neurology', head: 'Dr. Michael Chen', doctors: 12, patients: 148, appointments: 31, beds: 18, status: 'On track', color: '#7C5CFC' },
  { name: 'Gynaecology', head: 'Dr. Priya Shah', doctors: 14, patients: 176, appointments: 36, beds: 20, status: 'Review', color: '#E78D3A' },
  { name: 'General Medicine', head: 'Dr. Liam Rogers', doctors: 26, patients: 342, appointments: 68, beds: 44, status: 'At capacity', color: '#19A66A' },
  { name: 'Orthopedics', head: 'Dr. James Okafor', doctors: 11, patients: 125, appointments: 22, beds: 18, status: 'On track', color: '#22C7D6' },
  { name: 'Dermatology', head: 'Dr. Emily Patel', doctors: 8, patients: 96, appointments: 19, beds: 10, status: 'On track', color: '#D94C5C' },
]

export const beds: Bed[] = [
  { id: 'G-101', ward: 'General', floor: 'Floor 1', status: 'available' },
  { id: 'G-102', ward: 'General', floor: 'Floor 1', status: 'occupied', patient: 'R. Alvarez' },
  { id: 'ICU-04', ward: 'ICU', floor: 'Floor 2', status: 'occupied', patient: 'S. Brown' },
  { id: 'ICU-05', ward: 'ICU', floor: 'Floor 2', status: 'reserved' },
  { id: 'ER-07', ward: 'Emergency', floor: 'Ground', status: 'maintenance' },
  { id: 'P-201', ward: 'Private', floor: 'Floor 2', status: 'available' },
]

export const healthSeries = [
  { day: 'Mon', heart: 70, systolic: 118, glucose: 92, weight: 68.4 },
  { day: 'Tue', heart: 72, systolic: 121, glucose: 88, weight: 68.2 },
  { day: 'Wed', heart: 68, systolic: 117, glucose: 90, weight: 68.1 },
  { day: 'Thu', heart: 74, systolic: 124, glucose: 94, weight: 68.0 },
  { day: 'Fri', heart: 71, systolic: 119, glucose: 91, weight: 67.8 },
  { day: 'Sat', heart: 69, systolic: 116, glucose: 87, weight: 67.7 },
  { day: 'Sun', heart: 70, systolic: 118, glucose: 89, weight: 67.6 },
]

export const revenueSeries = [
  { day: 'Mon', revenue: 18.2, appointments: 42 },
  { day: 'Tue', revenue: 22.4, appointments: 52 },
  { day: 'Wed', revenue: 19.8, appointments: 45 },
  { day: 'Thu', revenue: 26.1, appointments: 61 },
  { day: 'Fri', revenue: 24.6, appointments: 56 },
  { day: 'Sat', revenue: 17.4, appointments: 39 },
  { day: 'Sun', revenue: 13.9, appointments: 28 },
]

export const patientStats: StatMetric[] = [
  { label: 'Upcoming appointments', value: '03', change: '+1 this week', detail: 'Next: Tue, 08 Oct', tone: 'blue', icon: CalendarDays },
  { label: 'Completed appointments', value: '18', change: '+12%', detail: 'vs. last quarter', tone: 'green', icon: ClipboardList },
  { label: 'Active prescriptions', value: '02', change: 'No changes', detail: 'Both up to date', tone: 'purple', icon: Pill },
  { label: 'Lab reports', value: '06', change: '2 new', detail: 'Ready to review', tone: 'cyan', icon: FileText },
]

export const doctorStats: StatMetric[] = [
  { label: "Today's appointments", value: '12', change: '+3 vs. yesterday', detail: 'Next in 38 minutes', tone: 'blue', icon: CalendarDays },
  { label: 'Total patients', value: '248', change: '+8 this month', detail: 'Active care plans', tone: 'cyan', icon: UsersRound },
  { label: 'Completed visits', value: '184', change: '+14%', detail: 'This quarter', tone: 'green', icon: ClipboardList },
  { label: 'Pending requests', value: '07', change: 'Needs review', detail: 'Across 3 specialties', tone: 'orange', icon: Timer },
  { label: 'This month earnings', value: '$12.8k', change: '+18.4%', detail: 'Settled weekly', tone: 'purple', icon: WalletCards },
]

export const adminStats: StatMetric[] = [
  { label: 'Total patients', value: '12,842', change: '+8.6%', detail: 'vs. last month', tone: 'blue', icon: UsersRound },
  { label: 'Total doctors', value: '126', change: '+4.2%', detail: 'Across 8 departments', tone: 'cyan', icon: Stethoscope },
  { label: 'Available beds', value: '95', change: '78% occupied', detail: '12 reserved', tone: 'green', icon: BedDouble },
  { label: 'Total staff', value: '418', change: '+2.1%', detail: '92% active', tone: 'purple', icon: UserRound },
  { label: "Today's appointments", value: '246', change: '+14.8%', detail: '31 pending requests', tone: 'orange', icon: CalendarDays },
  { label: 'Monthly revenue', value: '$482.6k', change: '+12.4%', detail: '92% collected', tone: 'green', icon: BadgeDollarSign },
]

export const appointmentFlow = [
  { department: 'Cardiology', upcoming: 42, completed: 31, cancelled: 4 },
  { department: 'Neurology', upcoming: 29, completed: 24, cancelled: 2 },
  { department: 'General', upcoming: 58, completed: 46, cancelled: 7 },
  { department: 'Ortho', upcoming: 22, completed: 19, cancelled: 3 },
  { department: 'Dermatology', upcoming: 26, completed: 21, cancelled: 2 },
]
