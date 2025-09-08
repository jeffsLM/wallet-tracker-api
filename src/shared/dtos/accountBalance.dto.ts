import { z } from 'zod';

export const CreateBalanceSchema = z.object({
  competence: z.date().refine((date) => date <= new Date()),
  amount: z.number(),
  groupId: z.uuid('GroupId deve ser um UUID válido')
});

export const UpdateBalanceSchema = z.object({
  competence: z.date().refine((date) => date <= new Date()).optional(),
  amount: z.number().optional().nullable()
});

export const BalanceParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});


export type CreateBalanceDto = z.infer<typeof CreateBalanceSchema>;
export type UpdateBalanceDto = z.infer<typeof UpdateBalanceSchema>;
export type BalanceParamsDto = z.infer<typeof BalanceParamsSchema>;
