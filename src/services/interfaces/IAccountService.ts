import { Account } from '@prisma/client';
import { CreateAccountDto, UpdateAccountDto } from '../../shared/dtos/account.dto';

export interface IAccountService {
  create(data: CreateAccountDto): Promise<Account>;
  findById(id: string): Promise<Account>;
  findByFamilyId(familyId: string): Promise<Account[]>;
  findAll(): Promise<Account[]>;
  update(id: string, data: UpdateAccountDto): Promise<Account>;
  delete(id: string): Promise<void>;
}
