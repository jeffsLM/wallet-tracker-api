import { Transaction, Account, User, Payer } from '@prisma/client';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from '../../shared/dtos/transaction.dto';

export interface ITransactionRepository {
  create(data: CreateTransactionDto): Promise<Transaction>;
  findById(id: string): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null
  }) | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByCompetence(competence: Date): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null;
  })[]>;
  findByPeriod(dateStart: Date, dateEnd: Date): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null;
  })[]>
  findTransactionsByFamilyIds(familyIds: string[]): Promise<(Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null
  })[]>
  findWithFilters(filters: TransactionQueryDto): Promise<{
    transactions: (Transaction & {
      account: Account;
      user: User | null;
      payer: Payer | null
    })[];
    total: number;
  }>;
  findAll(): Promise<Transaction[]>;
  update(id: string, data: UpdateTransactionDto): Promise<Transaction>;
  delete(id: string): Promise<void>;

}
