import { z } from 'zod';

export const TransactionWhatsappPluginParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido'),
  purchaseType: z.string(),
  amount: z.string().optional(),
  parcelas: z.number().min(1).optional(),
  lastFourDigits: z.string().optional(),
  user: z.string().optional(),
  ocrText: z.string().optional(),
  timestamp: z.number().optional(),
  status: z.string().optional()
});



export type TransactionWhatsappPluginParamsDto = z.infer<typeof TransactionWhatsappPluginParamsSchema>;
