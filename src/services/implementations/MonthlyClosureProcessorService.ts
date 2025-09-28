
import { injectable, inject } from 'tsyringe';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { MonthlyClosureProcessorDto } from '../../shared/dtos/monthlyClosureProcessorService.dto';
import { IMonthlyClosureProcessorService } from '../interfaces/IMonthlyClosureProcessorService';
import { IMonthlyClosureRepository } from '../../repositories/interfaces/IMonthlyClosureRepository';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { IGroupBalanceRepository } from '../../repositories/interfaces/IGroupBalanceRepository';
import dayjs from 'dayjs';

@injectable()
export class MonthlyClosureProcessorService implements IMonthlyClosureProcessorService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('MonthlyClosureRepository')
    private monthlyClosureRepository: IMonthlyClosureRepository,
    @inject('GroupBalanceRepository')
    private groupBalanceRepository: IGroupBalanceRepository
  ) { }

  async create({ id }: MonthlyClosureProcessorDto) {

    const monthlyClosure = await this.monthlyClosureRepository.findById(id);
    if (!monthlyClosure) {
      throw new NotFoundError('Monthly closure not found');
    }

    const transactions = await this.transactionRepository.findByCompetence(monthlyClosure.competence);
    const groupBalances = await this.groupBalanceRepository.findByCompetence(monthlyClosure.competence);

    const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
    const totalIncome = groupBalances.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);

    const groupBalancesUpdated = groupBalances.map((groupBalance) => {
      const accounts = groupBalance.group.accounts.map((account) => {
        return {
          id: account.id,
          name: account.name,
          amount: account.transactions.reduce((acc, curr) => acc + curr.amount.toNumber(), 0)
        }
      })

      return {
        id: groupBalance.groupId,
        name: groupBalance.group.name,
        amountIncome: groupBalance.amount.toNumber(),
        amountExpenses: accounts.reduce((acc, curr) => acc + curr.amount, 0),
        accounts: accounts
      }
    });

    const nextMonthByCompetence = dayjs(monthlyClosure.competence).add(1, 'month');

    const negativeBalancesToNextMonth = groupBalancesUpdated.filter((groupBalance) => groupBalance.amountExpenses < groupBalance.amountIncome);
    const groupBalancesToNextMonth = negativeBalancesToNextMonth.map((groupBalance) => {
      return {
        groupId: groupBalance.id,
        competence: nextMonthByCompetence.toISOString(),
        amount: (groupBalance.amountExpenses - groupBalance.amountIncome) * -1,
        createdAt: new Date().toISOString(),
        description: 'Previous Month Balance'
      }
    });

    const hasIncomeToNextMonth = groupBalancesToNextMonth.length > 0;

    if (hasIncomeToNextMonth) {
      await this.groupBalanceRepository.createMany(groupBalancesToNextMonth);
    }

    await this.monthlyClosureRepository.update(id, { totalExpenses, totalIncome, status: 'closed' });
  }
}
