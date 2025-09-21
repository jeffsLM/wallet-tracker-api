import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  accountId: z.uuid('AccountId deve ser um UUID válido'),
  payerId: z.uuid('PayerId deve ser um UUID válido').optional().nullable(),
  userId: z.uuid('UserId deve ser um UUID válido').optional().nullable(),
  accountingPeriod: z.date('Data deve estar no formato ISO'),
  operationType: z.string().min(1, 'Tipo de operação é obrigatório'),
  amount: z.number().positive('Valor deve ser positivo'),
  installment: z.number().int().positive('Parcela deve ser um número positivo').optional().nullable(),
  finalInstallment: z.number().int().positive('Parcela final deve ser um número positivo').optional().nullable(),
  ocr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable()
});

export const UpdateTransactionSchema = z.object({
  payerId: z.uuid('PayerId deve ser um UUID válido').optional().nullable(),
  userId: z.uuid('UserId deve ser um UUID válido').optional().nullable(),
  accountingPeriod: z.string().optional().nullable(),
  operationType: z.string().min(1, 'Tipo de operação é obrigatório').optional(),
  amount: z.number().positive('Valor deve ser positivo').optional(),
  installment: z.number().int().positive('Parcela deve ser um número positivo').optional().nullable(),
  finalInstallment: z.number().int().positive('Parcela final deve ser um número positivo').optional().nullable(),
  ocr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable()
});

export const TransactionParamsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido')
});

export const TransactionByAccountParamsSchema = z.object({
  accountId: z.uuid('AccountId deve ser um UUID válido')
});

export const TransactionQuerySchema = z.object({
  startDate: z.date('Data inicial deve estar no formato ISO').optional(),
  endDate: z.date('Data final deve estar no formato ISO').optional(),
  accountId: z.uuid('AccountId deve ser um UUID válido').optional(),
  userId: z.uuid('UserId deve ser um UUID válido').optional(),
  payerId: z.uuid('PayerId deve ser um UUID válido').optional(),
  status: z.string().optional(),
  limit: z.number().optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Offset deve ser maior ou igual a 0').optional()
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type TransactionParamsDto = z.infer<typeof TransactionParamsSchema>;
export type TransactionByAccountParamsDto = z.infer<typeof TransactionByAccountParamsSchema>;
export type TransactionQueryDto = z.infer<typeof TransactionQuerySchema>;
