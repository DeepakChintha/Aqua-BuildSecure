import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format' }),
});

export const updatePatientProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name cannot exceed 100 characters' })
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    .optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
    .optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      message: 'Gender must be male, female, other, or prefer_not_to_say',
    })
    .optional(),
  address: z
    .string()
    .max(255, { message: 'Address cannot exceed 255 characters' })
    .optional(),
  emergency_contact: z
    .string()
    .max(100, { message: 'Emergency contact cannot exceed 100 characters' })
    .optional(),
  avatar_url: z
    .string()
    .url({ message: 'Invalid avatar URL' })
    .optional(),
});

export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>;
