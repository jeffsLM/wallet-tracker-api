import { z } from 'zod';

const TypeEnum = z.enum(['open', 'closed'], {
  message: 'Tipo deve ser: open ou closed',
});

export const CreateMonthlyClosureSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido'),
  competence: z.date().refine((date) => date <= new Date()),
});

export const UpdateMonthlyClosureSchema = z.object({
  competence: z.date().refine((date) => date <= new Date()).optional(),
  initialBalance: z.number().optional().nullable(),
  totalIncome: z.number().optional().nullable(),
  totalExpenses: z.number().optional().nullable(),
  status: TypeEnum.optional(),
});

export const MonthlyClosureParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export const MonthlyClosureByFamilyParamsSchema = z.object({
  familyId: z.uuid('FamilyId deve ser um UUID válido')
});

export type CreateMonthlyClosureDto = z.infer<typeof CreateMonthlyClosureSchema>;
export type UpdateMonthlyClosureDto = z.infer<typeof UpdateMonthlyClosureSchema>;
export type MonthlyClosureParamsDto = z.infer<typeof MonthlyClosureParamsSchema>;
export type MonthlyClosureByFamilyParamsDto = z.infer<typeof MonthlyClosureByFamilyParamsSchema>;
