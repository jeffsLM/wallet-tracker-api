import { inject, injectable } from 'tsyringe';
import { PrismaClient, Payer } from '@prisma/client';
import { IPayerRepository } from '../interfaces/IPayerRepository';
import { CreatePayerDto, UpdatePayerDto } from '../../shared/dtos/payer.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class PayerRepository implements IPayerRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreatePayerDto): Promise<Payer> {
    return this.prisma.payer.create({
      data: {
        ...data,
        createAt: new Date()
      }
    });
  }

  async findById(id: string): Promise<Payer | null> {
    return this.prisma.payer.findUnique({
      where: { id }
    });
  }

  async findAll(): Promise<Payer[]> {
    return this.prisma.payer.findMany({
      orderBy: { createAt: 'desc' }
    });
  }

  async update(id: string, data: UpdatePayerDto): Promise<Payer> {
    const payer = await this.findById(id);
    if (!payer) {
      throw new NotFoundError('Pagador não encontrado');
    }

    return this.prisma.payer.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    const payer = await this.findById(id);
    if (!payer) {
      throw new NotFoundError('Pagador não encontrado');
    }

    await this.prisma.payer.delete({
      where: { id }
    });
  }
}
