import { z } from 'zod';

const TypeEnum = z.enum(['REFEICAO', 'ALIMENTACAO', 'CREDITO', 'DEBITO', 'VOUCHER'], {
  message: 'Tipo deve ser: REFEICAO, ALIMENTACAO, CREDITO, DEBITO ou VOUCHER',
});

export const WhatsappPluginTransactionSchema = z.object({
  id: z.string().optional(),
  purchaseType: TypeEnum.optional(),
  amount: z.string().optional(),
  parcelas: z.number().min(1).optional(),
  lastFourDigits: z.string().optional(),
  user: z.string().optional(),
  ocrText: z.string().optional(),
  timestamp: z.number().optional(),
  status: z.string().optional()
});

export type WhatsappPluginTransactionDto = z.infer<typeof WhatsappPluginTransactionSchema>;
