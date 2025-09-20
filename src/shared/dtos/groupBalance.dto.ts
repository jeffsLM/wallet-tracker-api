import { z } from 'zod';

export const CreateGroupBalanceSchema = z.object({
  competence: z.date().refine((date) => date <= new Date()),
  amount: z.number(),
  groupId: z.uuid('GroupId deve ser um UUID válido')
});

export const UpdateGroupBalanceSchema = z.object({
  competence: z.date().refine((date) => date <= new Date()).optional(),
  amount: z.number().optional().nullable()
});

export const GroupBalanceParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});


export type CreateGroupBalanceDto = z.infer<typeof CreateGroupBalanceSchema>;
export type UpdateGroupBalanceDto = z.infer<typeof UpdateGroupBalanceSchema>;
export type GroupBalanceParamsDto = z.infer<typeof GroupBalanceParamsSchema>;
