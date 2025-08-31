import { injectable, inject } from 'tsyringe';
import { AccountBalance } from '@prisma/client';
import { IAccountBalanceService } from '../interfaces/IAccountBalanceService';
import { IAccountBalanceRepository } from '../../repositories/interfaces/IAccountBalanceRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { CreateBalanceDto, UpdateBalanceDto } from '../../shared/dtos/accountBalance.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class AccountBalanceService implements IAccountBalanceService {
  constructor(
    @inject('AccountBalanceRepository')
    private accountBalanceRepository: IAccountBalanceRepository,
    @inject('AccountRepository')
    private accountRepository: IAccountRepository
  ) { }

  async create(data: CreateBalanceDto): Promise<AccountBalance> {
    // Verificar se a conta existe
    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }


    return this.accountBalanceRepository.create(data);
  }

  async findById(id: string): Promise<AccountBalance> {
    const account = await this.accountBalanceRepository.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
    return account;
  }

  async findByAccountId(accountId: string): Promise<AccountBalance[] | null> {
    // Verificar se a conta existe
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }

    return this.accountBalanceRepository.findByAccountId(accountId);
  }

  async findAll(): Promise<AccountBalance[]> {
    return this.accountBalanceRepository.findAll();
  }

  async update(id: string, data: UpdateBalanceDto): Promise<AccountBalance> {
    return this.accountBalanceRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.accountBalanceRepository.delete(id);
  }
}
