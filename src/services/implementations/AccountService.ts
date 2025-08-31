import { injectable, inject } from 'tsyringe';
import { Account } from '@prisma/client';
import { IAccountService } from '../interfaces/IAccountService';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { CreateAccountDto, UpdateAccountDto } from '../../shared/dtos/account.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class AccountService implements IAccountService {
  constructor(
    @inject('AccountRepository')
    private accountRepository: IAccountRepository,
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository
  ) { }

  async create(data: CreateAccountDto): Promise<Account> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(data.familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    const cardExists = await this.accountRepository.findByLast4Digits(data.last4Digits || '');
    if (cardExists) {
      throw new Error('Cartão já existe');
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

  async findByFamilyId(familyId: string): Promise<Account[]> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.accountRepository.findByFamilyId(familyId);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    return this.accountRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
