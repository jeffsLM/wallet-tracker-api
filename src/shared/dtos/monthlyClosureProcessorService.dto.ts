import { z } from 'zod';

export const MonthlyClosureProcessorSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export type MonthlyClosureProcessorDto = z.infer<typeof MonthlyClosureProcessorSchema>;
