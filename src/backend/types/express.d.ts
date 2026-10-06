export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  email?: string;
  role?: UserRole | string;
  profile_id?: string;
  patient_id?: string;
  doctor_id?: string;
  user_metadata?: Record<string, unknown>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
