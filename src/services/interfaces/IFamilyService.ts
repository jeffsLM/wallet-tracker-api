import { Family, User, Account } from '@prisma/client';
import { CreateFamilyDto, UpdateFamilyDto } from '../../shared/dtos/family.dto';

export interface IFamilyService {
  create(data: CreateFamilyDto): Promise<Family>;
  findById(id: string): Promise<Family>;
  findByIdWithUsers(id: string): Promise<Family & { users: User[] }>;
  findByIdWithAccounts(id: string): Promise<Family & { accounts: Account[] }>;
  findAll(): Promise<Family[]>;
  update(id: string, data: UpdateFamilyDto): Promise<Family>;
  delete(id: string): Promise<void>;
}
