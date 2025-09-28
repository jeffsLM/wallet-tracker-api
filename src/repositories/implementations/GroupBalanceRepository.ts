import { inject, injectable } from 'tsyringe';
import { PrismaClient, GroupBalance, Prisma, Group, Account, Transaction } from '@prisma/client';
import { IGroupBalanceRepository } from '../interfaces/IGroupBalanceRepository';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';
import dayjs from 'dayjs';

Prisma.validator<Prisma.GroupBalanceDefaultArgs>
const groupBalanceWithRelations = Prisma.validator<Prisma.GroupBalanceDefaultArgs>()({
  include: {
    group: {
      include: {
        accounts: {
          where: { active: true },
          include: {
            transactions: true
          }
        }
      }
    }
  }
});

export type GroupBalanceWithRelations = Prisma.GroupBalanceGetPayload<typeof groupBalanceWithRelations>;

@injectable()
export class GroupBalanceRepository implements IGroupBalanceRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateGroupBalanceDto): Promise<GroupBalance> {
    return this.prisma.groupBalance.create({
      data,
    });
  }

  async createMany(data: CreateGroupBalanceDto[]): Promise<Prisma.BatchPayload> {
    return this.prisma.groupBalance.createMany({
      data,
    });
  }

  async findById(id: string): Promise<GroupBalance | null> {
    const groupBalance = await this.prisma.groupBalance.findUnique({
      where: { id: id },
      include: { group: true },
    });
    return groupBalance;
  }
  async findByGroupId(id: string): Promise<GroupBalance[] | null> {
    const balances = await this.prisma.groupBalance.findMany({
      where: { groupId: id },
      include: { group: true },
    });
    return balances;
  }

  async findManybyAccountsIds(accountsIds: string[]): Promise<GroupBalance[] | null> {
    const balances = await this.prisma.groupBalance.findMany({
      where: { group: { accounts: { some: { id: { in: accountsIds } } } } },
      orderBy: { competence: 'desc' },
      include: {
        group: {
          include: {
            accounts: true
          }
        }
      },
    });
    return balances;
  }

  async findByCompetence(competence: Date): Promise<(GroupBalance & {
    group: Group & {
      accounts: (Account & {
        transactions: Transaction[];
      })[];
    };
  })[]> {
    const start = dayjs(competence).startOf('month').toDate();
    const end = dayjs(competence).endOf('month').toDate();

    const balances = await this.prisma.groupBalance.findMany({
      where: {
        competence: {
          gte: start,
          lt: end
        }
      },
      include: {
        group: {
          include: {
            accounts: {
              where: { active: true },
              include: {
                transactions: {
                  where: {
                    accountingPeriod: {
                      gte: start,
                      lt: end
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return balances;
  }

  async findAll(): Promise<GroupBalance[]> {
    return this.prisma.groupBalance.findMany({
      include: { group: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateGroupBalanceDto): Promise<GroupBalance> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.prisma.groupBalance.update({
      where: { id },
      data: {
        groupId: id,
        amount: data.amount ?? account.amount,
        competence: data.competence ?? account.competence,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<void> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    await this.prisma.account.delete({
      where: { id }
    });
  }
}
