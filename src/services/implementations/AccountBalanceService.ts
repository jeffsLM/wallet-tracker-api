import { injectable, inject } from 'tsyringe';
import { AccountBalance } from '@prisma/client';
import { IAccountBalanceService } from '../interfaces/IAccountBalanceService';
import { IAccountBalanceRepository } from '../../repositories/interfaces/IAccountBalanceRepository';
import { CreateBalanceDto, UpdateBalanceDto } from '../../shared/dtos/accountBalance.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { IGroupRepository } from '../../repositories/interfaces/IGroupRepository';

@injectable()
export class AccountBalanceService implements IAccountBalanceService {
  constructor(
    @inject('AccountBalanceRepository')
    private accountBalanceRepository: IAccountBalanceRepository,
    @inject('GroupRepository')
    private groupRepository: IGroupRepository
  ) { }

  async create(data: CreateBalanceDto): Promise<AccountBalance> {
    const group = await this.groupRepository.findById(data.groupId);
    if (!group) {
      throw new NotFoundError('Grupo da conta não encontrado');
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

  async findByAccountId(id: string): Promise<AccountBalance[] | null> {
    // Verificar se a conta existe
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundError('Grupo não encontrado');
    }

    return this.accountBalanceRepository.findByGroupId(id);
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
