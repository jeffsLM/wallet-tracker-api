import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from '../../shared/dtos/user.dto';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByFamilyId(familyId: string): Promise<User[]>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
