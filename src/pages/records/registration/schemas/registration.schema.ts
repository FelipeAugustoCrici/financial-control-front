import { z } from 'zod';

export const registrationSchema = z.object({
  description: z.string().min(1),
  value: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valor inválido'),
  date: z.string(),
  categoryName: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['expense', 'salary', 'income']),
  personId: z.string().min(1),
  familyId: z.string().min(1),
  isRecurring: z.boolean(),
  durationMonths: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
