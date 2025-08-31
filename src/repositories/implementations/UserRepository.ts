import { inject, injectable } from 'tsyringe';
import { PrismaClient, User } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CreateUserDto, UpdateUserDto } from '../../shared/dtos/user.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        createAt: new Date()
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { family: true }
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { phone: phoneNumber },
      include: { family: true }
    });
  }

  async findByFamilyId(familyId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { familyId },
      include: { family: true },
      orderBy: { createAt: 'desc' }
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { family: true },
      orderBy: { createAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    await this.prisma.user.delete({
      where: { id }
    });
  }
}
