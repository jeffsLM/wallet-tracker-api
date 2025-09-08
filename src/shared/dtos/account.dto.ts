import { z } from 'zod';

const TypeEnum = z.enum(['REFEICAO', 'ALIMENTACAO', 'CREDITO', 'DEBITO', 'VOUCHER'], {
  message: 'Tipo deve ser: REFEICAO, ALIMENTACAO, CREDITO, DEBITO ou VOUCHER',
});

export const CreateAccountSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: TypeEnum.optional(),
  last4Digits: z.string().length(4, 'Last4Digits deve ter exatamente 4 dígitos').optional().nullable(),
  active: z.boolean().default(true),
  groupId: z.string().optional().nullable()
});

export const UpdateAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  type: TypeEnum.optional(),
  last4Digits: z.string().length(4, 'Last4Digits deve ter exatamente 4 dígitos').optional().nullable(),
  active: z.boolean().optional(),
  groupId: z.string().optional().nullable()
});

export const AccountParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export const AccountByFamilyParamsSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido')
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export type AccountParamsDto = z.infer<typeof AccountParamsSchema>;
export type AccountByFamilyParamsDto = z.infer<typeof AccountByFamilyParamsSchema>;
