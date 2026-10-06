import { z } from 'zod';

export const appointmentIdParamSchema = z.object({
  id: z.string().min(1, { message: 'Appointment ID is required' }),
});

export const createAppointmentSchema = z.object({
  doctor_id: z.string().uuid({ message: 'doctor_id must be a valid UUID' }),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'appointment_date must be in YYYY-MM-DD format' }),
  appointment_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
      message: 'appointment_time must be in HH:mm or HH:mm:ss format',
    }),
  reason: z.string().max(500, { message: 'reason cannot exceed 500 characters' }).optional(),
});

export const updateAppointmentSchema = z.object({
  status: z
    .enum(['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'], {
      message: 'Invalid appointment status',
    })
    .optional(),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  appointment_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .optional(),
  reason: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
