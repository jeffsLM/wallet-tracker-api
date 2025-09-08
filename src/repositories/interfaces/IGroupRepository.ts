import { Group } from '@prisma/client';
import { CreateGroupDto, UpdateGroupDto } from '../../shared/dtos/group.dto';

export interface IGroupRepository {
  create(data: CreateGroupDto): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findByName(name: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  update(id: string, data: UpdateGroupDto): Promise<Group>;
  delete(id: string): Promise<void>;
}
