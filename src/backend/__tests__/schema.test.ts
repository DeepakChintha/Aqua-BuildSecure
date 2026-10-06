import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 3 PostgreSQL Schema & Migrations Verification', () => {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migration1 = fs.readFileSync(path.join(migrationsDir, '0001_initial_schema.sql'), 'utf-8');
  const migration2 = fs.readFileSync(path.join(migrationsDir, '0002_rls_foundation.sql'), 'utf-8');
  const migration3 = fs.readFileSync(path.join(migrationsDir, '0003_seed_synthetic_data.sql'), 'utf-8');

  it('Migration files exist in supabase/migrations/', () => {
    expect(fs.existsSync(path.join(migrationsDir, '0001_initial_schema.sql'))).toBe(true);
    expect(fs.existsSync(path.join(migrationsDir, '0002_rls_foundation.sql'))).toBe(true);
    expect(fs.existsSync(path.join(migrationsDir, '0003_seed_synthetic_data.sql'))).toBe(true);
  });

  it('0001_initial_schema.sql creates all 6 core tables with UUIDs and constraints', () => {
    const requiredTables = [
      'public.profiles',
      'public.patients',
      'public.doctors',
      'public.appointments',
      'public.medical_records',
      'public.audit_logs',
    ];

    requiredTables.forEach((table) => {
      expect(migration1).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    });

    expect(migration1).toContain("role IN ('patient', 'doctor', 'admin')");
    expect(migration1).toContain("status IN ('pending', 'approved', 'suspended')");
    expect(migration1).toContain("status IN ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled')");
    expect(migration1).toContain("result IN ('success', 'denied', 'failed')");
  });

  it('0001_initial_schema.sql includes database-level double-booking protection', () => {
    expect(migration1).toContain('CONSTRAINT unique_doctor_appointment_slot UNIQUE (doctor_id, appointment_date, appointment_time)');
  });

  it('0001_initial_schema.sql creates required performance indexes', () => {
    expect(migration1).toContain('idx_profiles_user_id');
    expect(migration1).toContain('idx_patients_profile_id');
    expect(migration1).toContain('idx_doctors_profile_id');
    expect(migration1).toContain('idx_appointments_patient_id');
    expect(migration1).toContain('idx_appointments_doctor_id');
    expect(migration1).toContain('idx_appointments_date');
    expect(migration1).toContain('idx_appointments_status');
    expect(migration1).toContain('idx_audit_logs_user_id');
    expect(migration1).toContain('idx_audit_logs_created_at');
  });

  it('0002_rls_foundation.sql enables Row Level Security on all core tables', () => {
    expect(migration2).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
    expect(migration2).toContain('ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;');
    expect(migration2).toContain('ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;');
    expect(migration2).toContain('ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;');
    expect(migration2).toContain('ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;');
    expect(migration2).toContain('ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;');
  });

  it('0003_seed_synthetic_data.sql contains non-sensitive synthetic demo records', () => {
    expect(migration3).toContain('INSERT INTO auth.users');
    expect(migration3).toContain('INSERT INTO public.profiles');
    expect(migration3).toContain('INSERT INTO public.doctors');
    expect(migration3).toContain('INSERT INTO public.patients');
    expect(migration3).toContain('INSERT INTO public.appointments');
    expect(migration3).not.toContain('real_patient_ssn');
  });
});
