import { z } from 'zod';

export const CreateGroupBalanceSchema = z.object({
  competence: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Data deve estar no formato ISO válido"
  ),
  amount: z.number(),
  description: z.string().optional().nullable(),
  groupId: z.uuid('GroupId deve ser um UUID válido')
});

export const UpdateGroupBalanceSchema = z.object({
  competence: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Data deve estar no formato ISO válido"
  ).optional().nullable(),
  amount: z.number().optional().nullable()
});

export const GroupBalanceParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});


export type CreateGroupBalanceDto = z.infer<typeof CreateGroupBalanceSchema>;
export type UpdateGroupBalanceDto = z.infer<typeof UpdateGroupBalanceSchema>;
export type GroupBalanceParamsDto = z.infer<typeof GroupBalanceParamsSchema>;
