import { Account } from '@prisma/client';
import { CreateAccountDto, UpdateAccountDto } from '../../shared/dtos/account.dto';

export interface IAccountRepository {
  create(data: CreateAccountDto): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByLast4Digits(last4Digits: string): Promise<Account | null>;
  findByFamilyId(familyId: string): Promise<Account[]>;
  findAll(): Promise<Account[]>;
  update(id: string, data: UpdateAccountDto): Promise<Account>;
  delete(id: string): Promise<void>;
}
