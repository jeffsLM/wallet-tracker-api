import { injectable, inject } from 'tsyringe';
import { Family, User, Account } from '@prisma/client';
import { IFamilyService } from '../interfaces/IFamilyService';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { CreateFamilyDto, UpdateFamilyDto } from '../../shared/dtos/family.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class FamilyService implements IFamilyService {
  constructor(
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository
  ) { }

  async create(data: CreateFamilyDto): Promise<Family> {
    return this.familyRepository.create(data);
  }

  async findById(id: string): Promise<Family> {
    const family = await this.familyRepository.findById(id);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }
    return family;
  }

  async findByIdWithUsers(id: string): Promise<Family & { users: User[] }> {
    const family = await this.familyRepository.findByIdWithUsers(id);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }
    return family;
  }

  async findByIdWithAccounts(id: string): Promise<Family & { accounts: Account[] }> {
    const family = await this.familyRepository.findByIdWithAccounts(id);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }
    return family;
  }

  async findAll(): Promise<Family[]> {
    return this.familyRepository.findAll();
  }

  async update(id: string, data: UpdateFamilyDto): Promise<Family> {
    return this.familyRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.familyRepository.delete(id);
  }
}
