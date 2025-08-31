import { injectable, inject } from 'tsyringe';
import { Transaction, Account, User, Payer } from '@prisma/client';
import { ITransactionService } from '../interfaces/ITransactionService';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IPayerRepository } from '../../repositories/interfaces/IPayerRepository';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from '../../shared/dtos/transaction.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('AccountRepository')
    private accountRepository: IAccountRepository,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('PayerRepository')
    private payerRepository: IPayerRepository
  ) { }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    if (data.userId) {
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }
    }

    if (data.payerId) {
      const payer = await this.payerRepository.findById(data.payerId);
      if (!payer) {
        throw new NotFoundError('Pagador não encontrado');
      }
    }

    return this.transactionRepository.create(data);
  }

  async findById(id: string): Promise<Transaction & {
    account: Account;
    user: User | null;
    payer: Payer | null
  }> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    return transaction;
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    // Verificar se a conta existe
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.transactionRepository.findByAccountId(accountId);
  }

  async findWithFilters(filters: TransactionQueryDto): Promise<{
    transactions: (Transaction & {
      account: Account;
      user: User | null;
      payer: Payer | null
    })[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const result = await this.transactionRepository.findWithFilters(filters);
    const totalPages = Math.ceil(result.total / limit);

    return {
      ...result,
      page,
      totalPages
    };
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    if (data.userId) {
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }
    }

    if (data.payerId) {
      const payer = await this.payerRepository.findById(data.payerId);
      if (!payer) {
        throw new NotFoundError('Pagador não encontrado');
      }
    }

    return this.transactionRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}
