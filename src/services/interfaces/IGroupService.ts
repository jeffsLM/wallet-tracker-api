import { Group } from '@prisma/client';
import { CreateGroupDto, UpdateGroupDto } from '../../shared/dtos/group.dto';

export interface IGroupService {
  create(data: CreateGroupDto): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findAll(): Promise<Group[]>;
  findByName(name: string): Promise<Group | null>;
  update(id: string, data: UpdateGroupDto): Promise<Group>;
  delete(id: string): Promise<void>;
}

