import { inject, injectable } from 'tsyringe';
import { PrismaClient, MonthlyClosure } from '@prisma/client';
import { IMonthlyClosureRepository } from '../interfaces/IMonthlyClosureRepository';
import { CreateMonthlyClosureDto, UpdateMonthlyClosureDto } from '../../shared/dtos/monthlyClosure.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class MonthlyClosureRepository implements IMonthlyClosureRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateMonthlyClosureDto): Promise<MonthlyClosure> {
    return this.prisma.monthlyClosure.create({
      data: {
        ...data,
        createdAt: new Date()
      },
    });
  }

  async findById(id: string): Promise<MonthlyClosure | null> {
    return this.prisma.monthlyClosure.findUnique({
      where: { id },
      include: { family: true }
    });
  }


  async findByFamilyId(familyId: string): Promise<MonthlyClosure[]> {
    return this.prisma.monthlyClosure.findMany({
      where: { familyId },
      include: { family: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(): Promise<MonthlyClosure[]> {
    return this.prisma.monthlyClosure.findMany({
      include: { family: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateMonthlyClosureDto): Promise<MonthlyClosure> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.prisma.monthlyClosure.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<void> {
    const account = await this.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    await this.prisma.monthlyClosure.delete({
      where: { id }
    });
  }
}
