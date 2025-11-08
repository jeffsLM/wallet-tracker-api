import { injectable, inject } from 'tsyringe';
import { IReportService } from '../interfaces/IReportService';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { ReportParamsByCompetenceDto, ExpensesOverview, OverflowToCredit, ExpansesOverviewByPayer, ReportParamsByPeriodDto } from '../../shared/dtos/report.dto';
import { IGroupBalanceRepository } from '../../repositories/interfaces/IGroupBalanceRepository';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);


@injectable()
export class ReportService implements IReportService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('GroupBalanceRepository')
    private groupBalanceRepository: IGroupBalanceRepository
  ) { }

  async expensesOverview(params: ReportParamsByCompetenceDto): Promise<ExpensesOverview> {
    const transactions = await this.transactionRepository.findByCompetenceAndAccountType(new Date(params.date), params?.accountType);
    const groupVoucher = await this.groupBalanceRepository.findByCompetence(new Date(params.date));
    const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
    const totalCredit = transactions.filter(t => t.account.type === 'CREDITO' && !t.account.groupId).reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
    const totalVoucher = groupVoucher.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
    const totalVoucherUsed = transactions.filter(t => t.account.groupId).reduce((acc, curr) => acc + curr.amount.toNumber(), 0);

    return {
      totalExpenses,
      totalCredit,
      totalVoucher: {
        totalVoucher: totalVoucher,
        totalVoucherUsed: totalVoucherUsed,
      }
    };
  }

  async overflowToCredit(params: ReportParamsByCompetenceDto): Promise<OverflowToCredit> {
    const startOfMonth = dayjs(params.date).startOf('month').toDate();
    const endOfMonth = dayjs(params.date).endOf('month').toDate();

    const groupBalances = await this.groupBalanceRepository.findByCompetence(dayjs(params.date).toDate());

    const allGroups = groupBalances
      .map((groupBalance) => {
        // Calcula total de despesas filtrando por competência
        const totalExpenses = groupBalance.group.accounts.reduce((accountAcc, account) => {
          const transactionsSum = account.transactions
            .filter(t => dayjs(t.accountingPeriod).isBetween(startOfMonth, endOfMonth, null, '[)'))
            .reduce((transAcc, transaction) =>
              transAcc + transaction.amount.toNumber(), 0
            );

          return accountAcc + transactionsSum;
        }, 0);

        return {
          name: groupBalance.group.name,
          totalExpenses,
          totalIncome: groupBalance.amount.toNumber()
        };
      });

    const allGroupsExpenses = allGroups.reduce((acc, curr) => acc + curr.totalExpenses, 0);
    const allGroupsIncome = allGroups.reduce((acc, curr) => acc + curr.totalIncome, 0);
    const amountRemaining = allGroupsExpenses - allGroupsIncome;

    return {
      allGroups,
      allGroupsExpenses,
      allGroupsIncome,
      amountRemaining
    };
  }

  async expansesOverviewByPayer(params: ReportParamsByCompetenceDto): Promise<ExpansesOverviewByPayer[]> {
    const transactions = await this.transactionRepository.findByCompetenceAndAccountType(new Date(params.date), params?.accountType);
    const expansesByPayer = transactions.reduce((acc, transaction) => {
      const payer = transaction.payer?.name ?? "Desconhecido";
      const amount = transaction.amount.toNumber();

      const existing = acc.find((item) => item.payer === payer);

      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({ payer, amount });
      }

      return acc;
    }, [] as { payer: string; amount: number }[]);

    return expansesByPayer;
  }


  async expansesOverviewByPeriodAndPayer(params: ReportParamsByPeriodDto): Promise<any> {
    const transactions = await this.transactionRepository.findByPeriodAndAccountType(
      new Date(params.startDate),
      new Date(params.endDate),
      params?.accountType
    );

    // 1. Lista de todos os pagadores distintos
    const allPayers = Array.from(
      new Set(transactions.map(t => t.payer?.name ?? "Desconhecido"))
    );

    // 2. Gerar todos os meses do período
    const startDate = dayjs(params.startDate);
    const endDate = dayjs(params.endDate);
    const allMonths: string[] = [];

    let currentMonth = startDate.startOf('month');
    while (currentMonth.isBefore(endDate)) {
      allMonths.push(currentMonth.format("YYYY-MM"));
      currentMonth = currentMonth.add(1, 'month');
    }

    // 3. Agrupar transações por mês e somar valores
    const grouped = transactions.reduce<Record<string, Record<string, number>>>(
      (acc, t) => {
        const month = dayjs(t.accountingPeriod).format("YYYY-MM");
        const payer = t.payer?.name ?? "Desconhecido";
        if (!acc[month]) acc[month] = {};
        acc[month][payer] = (acc[month][payer] ?? 0) + t.amount.toNumber();
        return acc;
      },
      {}
    );

    // 4. Criar resultado com todos os meses (com ou sem transações)
    const expansesByPayer = allMonths.map(month => {
      const base = Object.fromEntries(allPayers.map(p => [p, 0]));
      return {
        month,
        ...base,
        ...(grouped[month] || {}),
      };
    });

    return expansesByPayer;
  }

  async expansesOverviewByPeriod(params: ReportParamsByPeriodDto): Promise<any> {
    const transactions = await this.transactionRepository.findByPeriodAndAccountType(
      new Date(params.startDate),
      new Date(params.endDate),
      params?.accountType
    );

    // 1. Gerar todos os meses do período
    const startDate = dayjs(params.startDate);
    const endDate = dayjs(params.endDate);
    const allMonths: string[] = [];

    let currentMonth = startDate.startOf('month');
    while (currentMonth.isBefore(endDate)) {
      allMonths.push(currentMonth.format("YYYY-MM"));
      currentMonth = currentMonth.add(1, 'month');
    }

    // 2. Agrupar transações por mês
    const expansesByMonth = transactions.reduce((acc, transaction) => {
      const monthKey = dayjs(transaction.accountingPeriod).format('YYYY-MM');

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
        };
      }

      acc[monthKey].total += transaction.amount.toNumber();


      return acc;
    }, {} as Record<string, { month: string; total: number }>);

    // 3. Criar resultado com todos os meses (preenchendo com zeros quando necessário)
    const result = allMonths.map(month => {
      return expansesByMonth[month] || {
        month,
        total: 0,
      };
    });

    return result;
  }
}
