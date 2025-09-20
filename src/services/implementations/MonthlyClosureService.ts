import { injectable, inject } from 'tsyringe';
import { MonthlyClosure } from '@prisma/client';
import { IMonthlyClosureService } from '../interfaces/IMonthlyClosureService';
import { IMonthlyClosureRepository } from '../../repositories/interfaces/IMonthlyClosureRepository';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { CreateMonthlyClosureDto, UpdateMonthlyClosureDto } from '../../shared/dtos/monthlyClosure.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class MonthlyClosureService implements IMonthlyClosureService {
  constructor(
    @inject('MonthltyClosureRepository')
    private monthlyClosureRepository: IMonthlyClosureRepository,
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository
  ) { }

  async create(data: CreateMonthlyClosureDto): Promise<MonthlyClosure> {
    const family = await this.familyRepository.findById(data.familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.monthlyClosureRepository.create(data);
  }

  async findById(id: string): Promise<MonthlyClosure> {
    const account = await this.monthlyClosureRepository.findById(id);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
    return account;
  }

  async findByFamilyId(familyId: string): Promise<MonthlyClosure[]> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.monthlyClosureRepository.findByFamilyId(familyId);
  }

  async findAll(): Promise<MonthlyClosure[]> {
    return this.monthlyClosureRepository.findAll();
  }

  async update(id: string, data: UpdateMonthlyClosureDto): Promise<MonthlyClosure> {
    return this.monthlyClosureRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.monthlyClosureRepository.delete(id);
  }
}
