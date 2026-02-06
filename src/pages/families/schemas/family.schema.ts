import { z } from 'zod';

export const createFamilySchema = z.object({
  name: z.string().min(1, 'Nome da família é obrigatório'),
});

export type CreateFamilyFormData = z.infer<typeof createFamilySchema>;

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Nome do membro é obrigatório'),
});

export type CreateMemberFormData = z.infer<typeof createMemberSchema>;
