import { z } from 'zod';

export const doctorIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid doctor UUID format' }),
});

export const doctorQuerySchema = z.object({
  specialization: z.string().optional(),
  status: z.enum(['pending', 'approved', 'suspended']).optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0))
    .optional(),
});

export const updateDoctorProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  specialization: z.string().min(2).max(100).optional(),
  license_number: z.string().min(3).max(50).optional(),
  experience_years: z.number().int().min(0).max(70).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatar_url: z.string().url().optional(),
});

export type DoctorQueryInput = z.infer<typeof doctorQuerySchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;
