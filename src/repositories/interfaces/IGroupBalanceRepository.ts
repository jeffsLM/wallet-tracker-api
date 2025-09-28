import { GroupBalance, Group, Account, Transaction, Prisma } from '@prisma/client';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';



export interface IGroupBalanceRepository {
  create(data: CreateGroupBalanceDto): Promise<GroupBalance>;
  createMany(data: CreateGroupBalanceDto[]): Promise<Prisma.BatchPayload>;
  findById(id: string): Promise<GroupBalance | null>;
  findByGroupId(id: string): Promise<GroupBalance[] | null>;
  findManybyAccountsIds(accountsIds: string[]): Promise<GroupBalance[] | null>;
  findByCompetence(competence: Date): Promise<(GroupBalance & {
    group: Group & {
      accounts: (Account & {
        transactions: Transaction[];
      })[];
    };
  })[]>;
  findAll(): Promise<GroupBalance[]>;
  update(id: string, data: UpdateGroupBalanceDto): Promise<GroupBalance>;
  delete(id: string): Promise<void>;
}
