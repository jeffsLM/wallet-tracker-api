import { inject, injectable } from 'tsyringe';
import { PrismaClient, Family, User, Account } from '@prisma/client';
import { IFamilyRepository } from '../interfaces/IFamilyRepository';
import { CreateFamilyDto, UpdateFamilyDto } from '../../shared/dtos/family.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class FamilyRepository implements IFamilyRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateFamilyDto): Promise<Family> {
    return this.prisma.family.create({
      data: {
        ...data,
        createAt: new Date()
      }
    });
  }

  async findById(id: string): Promise<Family | null> {
    return this.prisma.family.findUnique({
      where: { id }
    });
  }

  async findByIdWithUsers(id: string): Promise<(Family & { users: User[] }) | null> {
    return this.prisma.family.findUnique({
      where: { id },
      include: { users: true }
    });
  }

  async findByIdWithAccounts(id: string): Promise<(Family & { accounts: Account[] }) | null> {
    return this.prisma.family.findUnique({
      where: { id },
      include: { accounts: true }
    });
  }

  async findAll(): Promise<Family[]> {
    return this.prisma.family.findMany({
      orderBy: { createAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateFamilyDto): Promise<Family> {
    const family = await this.findById(id);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.prisma.family.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    const family = await this.findById(id);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    await this.prisma.family.delete({
      where: { id }
    });
  }
}
