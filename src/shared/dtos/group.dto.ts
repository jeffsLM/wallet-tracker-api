import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório')
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

export const GroupParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});


export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
export type GroupParamsDto = z.infer<typeof GroupParamsSchema>;
