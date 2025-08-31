import { z } from 'zod';

export const CreateUserSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: z.string().optional().nullable()
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  phone: z.string().optional().nullable()
});

export const UserParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export const UserByFamilyParamsSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido')
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserParamsDto = z.infer<typeof UserParamsSchema>;
export type UserByFamilyParamsDto = z.infer<typeof UserByFamilyParamsSchema>;
