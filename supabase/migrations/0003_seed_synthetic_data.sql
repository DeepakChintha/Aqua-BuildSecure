-- CLINEXA Healthcare System - Phase 3 Synthetic Seed Data
-- Strictly non-sensitive, mock demonstration entries for local testing.

-- 1. Insert Mock Auth Users
INSERT INTO auth.users (id, email) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'admin.demo@clinexa.local'),
  ('d2222222-2222-2222-2222-222222222222', 'dr.smith@clinexa.local'),
  ('p3333333-3333-3333-3333-333333333333', 'john.doe@clinexa.local')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Profiles
INSERT INTO public.profiles (id, user_id, full_name, phone, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'System Administrator', '+1-555-0100', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Dr. Alice Smith', '+1-555-0101', 'doctor'),
  ('33333333-3333-3333-3333-333333333333', 'p3333333-3333-3333-3333-333333333333', 'John Doe (Demo)', '+1-555-0102', 'patient')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Doctor Metadata
INSERT INTO public.doctors (id, profile_id, specialization, license_number, experience_years, status) VALUES
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Cardiology', 'MD-LIC-99881', 12, 'approved')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Patient Metadata
INSERT INTO public.patients (id, profile_id, date_of_birth, gender, address, emergency_contact) VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '1990-05-15', 'Male', '123 Health Ave, Suite 4', '+1-555-9999')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Synthetic Appointment
INSERT INTO public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, reason, status) VALUES
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '2026-10-10', '09:30:00', 'Routine Checkup', 'confirmed')
ON CONFLICT (id) DO NOTHING;
