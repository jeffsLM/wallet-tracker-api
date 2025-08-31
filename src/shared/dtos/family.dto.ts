import { z } from 'zod';

export const CreateFamilySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres')
});

export const UpdateFamilySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional()
});

export const FamilyParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export type CreateFamilyDto = z.infer<typeof CreateFamilySchema>;
export type UpdateFamilyDto = z.infer<typeof UpdateFamilySchema>;
export type FamilyParamsDto = z.infer<typeof FamilyParamsSchema>;
