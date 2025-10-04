import { z } from 'zod';


export const ReportParamsByPeriodSchema = z.object({
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Data deve estar no formato ISO valido"
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Data deve estar no formato ISO valido"
  ),
  accountType: z.array(z.string()).optional(),
});
export const ReportParamsByCompetenceSchema = z.object({
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Data deve estar no formato ISO valido"
  ),
  accountType: z.array(z.string()).optional(),
});

export interface ExpensesOverview {
  totalExpenses: number;
  totalCredit: number;
  totalVoucher: {
    totalVoucher: number;
    totalVoucherUsed: number;
  }
}
export interface OverflowToCredit {
  allGroups: {
    name: string;
    totalExpenses: number;
    totalIncome: number
  }[];
  allGroupsExpenses: number;
  allGroupsIncome: number;
  amountRemaining: number;
}
export interface ExpansesOverviewByPayer {
  payer: string;
  amount: number;
}

export type ReportParamsByPeriodDto = z.infer<typeof ReportParamsByPeriodSchema>;
export type ReportParamsByCompetenceDto = z.infer<typeof ReportParamsByCompetenceSchema>;
