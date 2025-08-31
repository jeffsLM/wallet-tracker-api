import { AccountBalance } from '@prisma/client';
import { CreateBalanceDto, UpdateBalanceDto } from '../../shared/dtos/accountBalance.dto';

export interface IAccountBalanceService {
  create(data: CreateBalanceDto): Promise<AccountBalance>;
  findById(id: string): Promise<AccountBalance>;
  findByAccountId(accountId: string): Promise<AccountBalance[] | null>;
  findAll(): Promise<AccountBalance[]>;
  update(id: string, data: UpdateBalanceDto): Promise<AccountBalance>;
  delete(id: string): Promise<void>;
}
