-- CLINEXA Healthcare System - Phase 5 Row Level Security (RLS) Migration
-- Enforces strict role & resource-level data isolation policies across all tables.
-- Rule: NEVER use USING (true) on sensitive tables.

-- Helper function: Get user role from profiles table
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function: Get profile ID of authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function: Get patient ID of authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_patient_id()
RETURNS UUID AS $$
  SELECT p.id FROM public.patients p
  JOIN public.profiles pr ON p.profile_id = pr.id
  WHERE pr.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper function: Get doctor ID of authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_doctor_id()
RETURNS UUID AS $$
  SELECT d.id FROM public.doctors d
  JOIN public.profiles pr ON d.profile_id = pr.id
  WHERE pr.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Drop existing policies if present
DROP POLICY IF EXISTS "Profiles: self access and admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Patients: self access, assigned doctor access, admin access" ON public.patients;
DROP POLICY IF EXISTS "Doctors: self access, public approved doctor access, admin access" ON public.doctors;
DROP POLICY IF EXISTS "Appointments: patient self access, doctor assigned access, admin access" ON public.appointments;
DROP POLICY IF EXISTS "Medical Records: patient self view, assigned doctor access, admin view" ON public.medical_records;
DROP POLICY IF EXISTS "Audit Logs: admin view and authenticated insert" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit Logs: insert owned log entry" ON public.audit_logs;

-- 1. PROFILES TABLE RLS POLICIES
-- Users can access/update their own profile. Admin can manage all profiles.
CREATE POLICY "Profiles: self access and admin full access"
ON public.profiles
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  OR get_auth_user_role() = 'admin'
)
WITH CHECK (
  user_id = auth.uid()
  OR get_auth_user_role() = 'admin'
);

-- 2. PATIENTS TABLE RLS POLICIES
-- Patient A cannot access Patient B. Doctors can only access patients assigned via appointments. Admin can access all.
CREATE POLICY "Patients: self access, assigned doctor access, admin access"
ON public.patients
FOR ALL
TO authenticated
USING (
  profile_id = get_auth_profile_id()
  OR get_auth_user_role() = 'admin'
  OR (
    get_auth_user_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = public.patients.id
      AND a.doctor_id = get_auth_doctor_id()
    )
  )
)
WITH CHECK (
  profile_id = get_auth_profile_id()
  OR get_auth_user_role() = 'admin'
);

-- 3. DOCTORS TABLE RLS POLICIES
-- Doctor A cannot access arbitrary Doctor B private data. Doctors cannot self-approve. Admin can manage all.
CREATE POLICY "Doctors: self access, public approved doctor access, admin access"
ON public.doctors
FOR ALL
TO authenticated
USING (
  profile_id = get_auth_profile_id()
  OR status = 'approved'
  OR get_auth_user_role() = 'admin'
)
WITH CHECK (
  (profile_id = get_auth_profile_id() AND status != 'approved') -- Prevent self-approval
  OR get_auth_user_role() = 'admin'
);

-- 4. APPOINTMENTS TABLE RLS POLICIES
-- Patients access own appointments; Doctors access assigned appointments; Admin manages all.
CREATE POLICY "Appointments: patient self access, doctor assigned access, admin access"
ON public.appointments
FOR ALL
TO authenticated
USING (
  patient_id = get_auth_patient_id()
  OR doctor_id = get_auth_doctor_id()
  OR get_auth_user_role() = 'admin'
)
WITH CHECK (
  (patient_id = get_auth_patient_id() AND status = 'requested')
  OR doctor_id = get_auth_doctor_id()
  OR get_auth_user_role() = 'admin'
);

-- 5. MEDICAL RECORDS TABLE RLS POLICIES
-- Patient can view own records. Doctors CANNOT access arbitrary patient medical records. Only assigned doctors can read/create.
CREATE POLICY "Medical Records: patient self view, assigned doctor access, admin view"
ON public.medical_records
FOR ALL
TO authenticated
USING (
  patient_id = get_auth_patient_id()
  OR (
    get_auth_user_role() = 'doctor'
    AND doctor_id = get_auth_doctor_id()
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = public.medical_records.patient_id
      AND a.doctor_id = get_auth_doctor_id()
    )
  )
  OR get_auth_user_role() = 'admin'
)
WITH CHECK (
  (
    get_auth_user_role() = 'doctor'
    AND doctor_id = get_auth_doctor_id()
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = public.medical_records.patient_id
      AND a.doctor_id = get_auth_doctor_id()
    )
  )
  OR get_auth_user_role() = 'admin'
);

-- 6. AUDIT LOGS TABLE RLS POLICIES
-- Only Admin can view audit logs. Users can record audit logs for their own actions.
CREATE POLICY "Audit Logs: admin view and authenticated insert"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  get_auth_user_role() = 'admin'
);

CREATE POLICY "Audit Logs: insert owned log entry"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR get_auth_user_role() = 'admin'
);
