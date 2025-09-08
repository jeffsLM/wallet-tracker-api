import { inject, injectable } from 'tsyringe';
import { PrismaClient, Group } from '@prisma/client';
import { IGroupRepository } from '../interfaces/IGroupRepository';
import { CreateGroupDto, UpdateGroupDto } from '../../shared/dtos/group.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class GroupRepository implements IGroupRepository {
  constructor(
    @inject('PrismaClient')
    private prisma: PrismaClient
  ) { }


  async create(data: CreateGroupDto): Promise<Group> {
    return this.prisma.group.create({
      data
    });
  }

  async findById(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: { accounts: true }
    });
  }
  async findByName(name: string): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      include: { accounts: true }
    });
  }

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({
      include: { accounts: true },
    });
  }

  async update(id: string, data: UpdateGroupDto): Promise<Group> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundError('Grupo não encontrado');
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string): Promise<void> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundError('Grupo não encontrado');
    }

    await this.prisma.group.delete({
      where: { id }
    });
  }
}
