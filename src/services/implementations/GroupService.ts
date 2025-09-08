import { injectable, inject } from 'tsyringe';
import { Group } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../shared/middlewares/error.middleware';
import { IGroupRepository } from '../../repositories/interfaces/IGroupRepository';
import { IGroupService } from '../interfaces/IGroupService';
import { CreateGroupDto, UpdateGroupDto } from '../../shared/dtos/group.dto';

@injectable()
export class GroupService implements IGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,
  ) { }

  async create(data: CreateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findByName(data.name);
    if (!group) {
      throw new ConflictError('Grupo já criado');
    }

    return this.groupRepository.create(data);
  }

  async findById(id: string): Promise<Group> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundError('Conta não encontrada');
    }
    return group;
  }

  async findByName(name: string): Promise<Group> {
    const group = await this.groupRepository.findByName(name);
    if (!group) {
      throw new NotFoundError('Conta não encontrada');
    }
    return group;
  }


  async findAll(): Promise<Group[]> {
    return this.groupRepository.findAll();
  }

  async update(id: string, data: UpdateGroupDto): Promise<Group> {
    return this.groupRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.groupRepository.delete(id);
  }
}
