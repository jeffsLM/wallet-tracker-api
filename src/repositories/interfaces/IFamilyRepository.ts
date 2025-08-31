import { Family, User, Account } from '@prisma/client';
import { CreateFamilyDto, UpdateFamilyDto } from '../../shared/dtos/family.dto';

export interface IFamilyRepository {
  create(data: CreateFamilyDto): Promise<Family>;
  findById(id: string): Promise<Family | null>;
  findByIdWithUsers(id: string): Promise<(Family & { users: User[] }) | null>;
  findByIdWithAccounts(id: string): Promise<(Family & { accounts: Account[] }) | null>;
  findAll(): Promise<Family[]>;
  update(id: string, data: UpdateFamilyDto): Promise<Family>;
  delete(id: string): Promise<void>;
}
