import { GroupBalance } from '@prisma/client';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';

export interface IGroupBalanceService {
  create(data: CreateGroupBalanceDto): Promise<GroupBalance>;
  findById(id: string): Promise<GroupBalance>;
  findByAccountId(accountId: string): Promise<GroupBalance[] | null>;
  findAll(): Promise<GroupBalance[]>;
  update(id: string, data: UpdateGroupBalanceDto): Promise<GroupBalance>;
  delete(id: string): Promise<void>;
}
