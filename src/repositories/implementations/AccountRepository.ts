import { inject, injectable } from 'tsyringe';
import { PrismaClient, Account } from '@prisma/client';
import { IAccountRepository } from '../interfaces/IAccountRepository';
import { CreateAccountDto, UpdateAccountDto } from '../../shared/dtos/account.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateAccountDto): Promise<Account> {
    return this.prisma.account.create({
      data: {
        name: data.name,
        type: data.type || '',
        active: data.active,
        familyId: data.familyId,
        last4Digits: data.last4Digits,
        createAt: new Date()
      },
    });
  }

  async findById(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: { family: true }
    });
  }

  async findByLast4Digits(last4Digits: string): Promise<Account | null> {
    return this.prisma.account.findFirst({
      where: {
        last4Digits: last4Digits
      },
      include: { family: true }
    });
  }

  async findByFamilyId(familyId: string): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { familyId },
      include: { family: true },
      orderBy: { createAt: 'desc' }
    });
  }

  async findAll(): Promise<Account[]> {
    return this.prisma.account.findMany({
      include: { family: true },
      orderBy: { createAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...data,
        updateAt: new Date()
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
