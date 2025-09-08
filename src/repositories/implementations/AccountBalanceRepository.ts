import { inject, injectable } from 'tsyringe';
import { PrismaClient, AccountBalance } from '@prisma/client';
import { IAccountBalanceRepository } from '../interfaces/IAccountBalanceRepository';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { CreateBalanceDto, UpdateBalanceDto } from '../../shared/dtos/accountBalance.dto';

@injectable()
export class AccountBalanceRepository implements IAccountBalanceRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateBalanceDto): Promise<AccountBalance> {
    return this.prisma.accountBalance.create({
      data: {
        groupId: data.groupId,
        amount: data.amount,
        competence: data.competence,
      },
    });
  }

  async findById(id: string): Promise<AccountBalance | null> {
    const balances = await this.prisma.accountBalance.findUnique({
      where: { id: id },
    });
    return balances;
  }
  async findByGroupId(id: string): Promise<AccountBalance[] | null> {
    const balances = await this.prisma.accountBalance.findMany({
      where: { groupId: id },
      include: { group: true },
    });
    return balances;
  }


  async findAll(): Promise<AccountBalance[]> {
    return this.prisma.accountBalance.findMany({
      include: { group: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateBalanceDto): Promise<AccountBalance> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.prisma.accountBalance.update({
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
