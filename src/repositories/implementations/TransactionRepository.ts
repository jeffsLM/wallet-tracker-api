import dayjs from 'dayjs';
import { inject, injectable } from 'tsyringe';
import { PrismaClient, Transaction, Account, User, Payer, Prisma, Group, GroupBalance } from '@prisma/client';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from '../../shared/dtos/transaction.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        ...data,
        accountingPeriod: dayjs(data.accountingPeriod).subtract(3, 'hours').toDate(),
        amount: new Prisma.Decimal(data.amount),
        createAt: dayjs().subtract(3, 'hours').toDate()
      }
    });
  }

  async findById(id: string): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null
  }) | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          include: { family: true }
        },
        user: {
          include: { family: true }
        },
        payer: true
      }
    });
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { accountId },
      include: {
        account: true,
        user: true,
        payer: true
      },
      orderBy: { createAt: 'desc' }
    });
  }

  async findTransactionsByFamilyIds(familyIds: string[]): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null
  })[]> {
    return this.prisma.transaction.findMany({
      where: { account: { familyId: { in: familyIds } } },
      include: {
        account: true,
        user: true,
        payer: true
      },
      orderBy: { createAt: 'desc' }
    });
  }

  async findByCompetenceAndAccountType(competence: Date, accountType?: string[]): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null;
  })[]> {
    const start = dayjs(competence).startOf('month').toDate();
    const end = dayjs(competence).endOf('month').toDate();
    const hasAccountType = accountType && accountType.length > 0;
    return this.prisma.transaction.findMany({
      where: {
        accountingPeriod: {
          gt: start,
          lte: end,
        },
        ...(hasAccountType && {
          account: {
            type: {
              in: accountType
            }
          }
        })
      },
      include: {
        account: true,
        user: true,
        payer: true,
      },
      orderBy: { createAt: 'desc' }
    });
  }
  async findByPeriodAndAccountType(dateStart: Date, dateEnd: Date, accountType?: string[]): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null;
  })[]> {
    const start = dayjs(dateStart).toDate();
    const end = dayjs(dateEnd).toDate();
    const hasAccountType = accountType && accountType.length > 0;

    return this.prisma.transaction.findMany({
      where: {
        accountingPeriod: {
          gt: start,
          lte: end,
        },
        ...(hasAccountType && {
          account: {
            type: {
              in: accountType
            }
          }
        })
      },
      include: {
        account: true,
        user: true,
        payer: true,
      },
      orderBy: { createAt: 'desc' }
    });
  }

  async findWithFilters(filters: TransactionQueryDto): Promise<{
    transactions: (Transaction & {
      account: Account;
      user: User | null;
      payer: Payer | null
    })[];
    total: number;
  }> {
    const where: Prisma.TransactionWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.accountingPeriod = {};

      if (filters.startDate) where.accountingPeriod.gte = new Date(filters.startDate);
      if (filters.endDate) where.accountingPeriod.lte = new Date(filters.endDate);
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.payerId) {
      where.payerId = filters.payerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: {
            include: { family: true }
          },
          user: {
            include: { family: true }
          },
          payer: true
        },
        orderBy: { createAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      }),
      this.prisma.transaction.count({ where })
    ]);

    return { transactions, total };
  }

  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      include: {
        account: true,
        user: true,
        payer: true
      },
      orderBy: { createAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }

    const updateData: any = { ...data };

    if (data.accountingPeriod) {
      updateData.accountingPeriod = new Date(data.accountingPeriod);
    }

    if (data.amount) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<void> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }

    await this.prisma.transaction.delete({
      where: { id }
    });
  }
}
