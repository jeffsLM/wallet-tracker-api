import { GroupBalance } from '@prisma/client';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';

export interface IGroupBalanceRepository {
  create(data: CreateGroupBalanceDto): Promise<GroupBalance>;
  findById(id: string): Promise<GroupBalance | null>;
  findByGroupId(id: string): Promise<GroupBalance[] | null>;
  findAll(): Promise<GroupBalance[]>;
  update(id: string, data: UpdateGroupBalanceDto): Promise<GroupBalance>;
  delete(id: string): Promise<void>;
}
