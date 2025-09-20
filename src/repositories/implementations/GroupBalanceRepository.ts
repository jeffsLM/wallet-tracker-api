import { inject, injectable } from 'tsyringe';
import { PrismaClient, GroupBalance } from '@prisma/client';
import { IGroupBalanceRepository } from '../interfaces/IGroupBalanceRepository';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';

@injectable()
export class GroupBalanceRepository implements IGroupBalanceRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateGroupBalanceDto): Promise<GroupBalance> {
    return this.prisma.groupBalance.create({
      data: {
        groupId: data.groupId,
        amount: data.amount,
        competence: data.competence,
      },
    });
  }

  async findById(id: string): Promise<GroupBalance | null> {
    const balances = await this.prisma.groupBalance.findUnique({
      where: { id: id },
    });
    return balances;
  }
  async findByGroupId(id: string): Promise<GroupBalance[] | null> {
    const balances = await this.prisma.groupBalance.findMany({
      where: { groupId: id },
      include: { group: true },
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
