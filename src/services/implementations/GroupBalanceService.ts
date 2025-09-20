import { injectable, inject } from 'tsyringe';
import { GroupBalance } from '@prisma/client';
import { IGroupBalanceService } from '../interfaces/IGroupBalanceService';
import { IGroupBalanceRepository } from '../../repositories/interfaces/IGroupBalanceRepository';
import { CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../../shared/dtos/groupBalance.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';
import { IGroupRepository } from '../../repositories/interfaces/IGroupRepository';

@injectable()
export class GroupBalanceService implements IGroupBalanceService {
  constructor(
    @inject('GroupBalanceRepository')
    private groupBalanceRepository: IGroupBalanceRepository,
    @inject('GroupRepository')
    private groupRepository: IGroupRepository
  ) { }

  async create(data: CreateGroupBalanceDto): Promise<GroupBalance> {
    const group = await this.groupRepository.findById(data.groupId);
    if (!group) {
      throw new NotFoundError('Grupo da conta não encontrado');
    }

    return this.groupBalanceRepository.create(data);
  }

  async findById(id: string): Promise<GroupBalance> {
    const account = await this.groupBalanceRepository.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
    return account;
  }

  async findByAccountId(id: string): Promise<GroupBalance[] | null> {
    // Verificar se a conta existe
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundError('Grupo não encontrado');
    }

    return this.groupBalanceRepository.findByGroupId(id);
  }

  async findAll(): Promise<GroupBalance[]> {
    return this.groupBalanceRepository.findAll();
  }

  async update(id: string, data: UpdateGroupBalanceDto): Promise<GroupBalance> {
    return this.groupBalanceRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.groupBalanceRepository.delete(id);
  }
}
