import { injectable, inject } from 'tsyringe';
import { Account } from '@prisma/client';
import { IAccountService } from '../interfaces/IAccountService';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { CreateAccountDto, UpdateAccountDto } from '../../shared/dtos/account.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { IGroupBalanceRepository } from '../../repositories/interfaces/IGroupBalanceRepository';
import dayjs from 'dayjs';

@injectable()
export class AccountService implements IAccountService {
  constructor(
    @inject('AccountRepository')
    private accountRepository: IAccountRepository,
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository,
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('GroupBalanceRepository')
    private groupBalanceRepository: IGroupBalanceRepository
  ) { }

  async create(data: CreateAccountDto): Promise<Account> {
    const family = await this.familyRepository.findById(data.familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    const cardExists = await this.accountRepository.findByLast4Digits(data.last4Digits || '');
    if (cardExists) {
      throw new Error('Cartão já existe');
    }

    if (data.groupId) {
      const group = await this.accountRepository.findById(data.groupId);
      if (!group) {
        throw new NotFoundError('Grupo não encontrado');
      }
    }

    return this.accountRepository.create(data);
  }

  async findById(id: string): Promise<Account> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
    return account;
  }

  async findByFamilyId(familyId: string): Promise<(Account & { balance: number, hasBalance: boolean, totalUsed: number, totalUsedGroup: number })[]> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    const accounts = await this.accountRepository.findByFamilyId(familyId);

    const accountByTransaction = await this.transactionRepository.findTransactionsByFamilyIds([familyId]);
    const allAccountsIds = accounts.map((account) => account.id);
    const balances = await this.groupBalanceRepository.findManybyAccountsIds(allAccountsIds);


    const updatedAccounts = accounts.map((account) => {
      const accountTransactions = accountByTransaction.filter(t => t.accountId === account.id);
      const groupTransaction = accountByTransaction.filter(t => t.account.groupId === account.groupId);
      const totalUsed = accountTransactions.reduce((total, transaction) => total + transaction.amount.toNumber(), 0);
      const totalUsedGroup = groupTransaction.reduce((total, transaction) => total + transaction.amount.toNumber(), 0);
      const balance = balances?.find(b => b.groupId === account.groupId);
      const hastBalance = !!account.groupId

      return {
        ...account,
        balance: balance?.amount.toNumber() || 0,
        hasBalance: !!balance,
        totalUsed,
        totalUsedGroup: hastBalance ? totalUsedGroup : 0,
      }
    });


    return updatedAccounts;
  }

  async findAll(): Promise<Account[]> {
    const accounts = await this.accountRepository.findAll();
    const allAccountsIds = accounts.map((account) => account.id);
    const allFamilyId = accounts.map((account) => account.familyId);
    const balances = await this.groupBalanceRepository.findManybyAccountsIds(allAccountsIds);
    const accountByTransaction = await this.transactionRepository.findTransactionsByFamilyIds(allFamilyId);

    const updatedAccounts = accounts.map((account) => {
      const accountTransactions = accountByTransaction.filter(t => t.accountId === account.id);
      const groupTransaction = accountByTransaction.filter(t => t.account.groupId === account.groupId);
      const totalUsed = accountTransactions.reduce((total, transaction) => total + transaction.amount.toNumber(), 0);
      const totalUsedGroup = groupTransaction.reduce((total, transaction) => total + transaction.amount.toNumber(), 0);
      const balance = balances?.find(b => b.groupId === account.groupId && dayjs(b.competence).isSame(dayjs(), 'month'));
      const hastBalance = !!account.groupId

      return {
        ...account,
        balance: balance?.amount.toNumber() || 0,
        hasBalance: !!balance,
        totalUsed,
        totalUsedGroup: hastBalance ? totalUsedGroup : 0,
      }
    });

    return updatedAccounts
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    return this.accountRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
