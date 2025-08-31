import { z } from 'zod';

export const CreatePayerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres')
});

export const UpdatePayerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional()
});

export const PayerParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export type CreatePayerDto = z.infer<typeof CreatePayerSchema>;
export type UpdatePayerDto = z.infer<typeof UpdatePayerSchema>;
export type PayerParamsDto = z.infer<typeof PayerParamsSchema>;
