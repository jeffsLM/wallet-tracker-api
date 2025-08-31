import { injectable, inject } from 'tsyringe';
import { User } from '@prisma/client';
import { IUserService } from '../interfaces/IUserService';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { CreateUserDto, UpdateUserDto } from '../../shared/dtos/user.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository
  ) { }

  async create(data: CreateUserDto): Promise<User> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(data.familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.userRepository.create(data);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
    return user;
  }

  async findByFamilyId(familyId: string): Promise<User[]> {
    // Verificar se a família existe
    const family = await this.familyRepository.findById(familyId);
    if (!family) {
      throw new NotFoundError('Família não encontrada');
    }

    return this.userRepository.findByFamilyId(familyId);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
