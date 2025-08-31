import { injectable, inject } from 'tsyringe';
import { Payer } from '@prisma/client';
import { IPayerService } from '../interfaces/IPayerService';
import { IPayerRepository } from '../../repositories/interfaces/IPayerRepository';
import { CreatePayerDto, UpdatePayerDto } from '../../shared/dtos/payer.dto';
import { NotFoundError } from '../../shared/middlewares/error.middleware';

@injectable()
export class PayerService implements IPayerService {
  constructor(
    @inject('PayerRepository')
    private payerRepository: IPayerRepository
  ) { }

  async create(data: CreatePayerDto): Promise<Payer> {
    return this.payerRepository.create(data);
  }

  async findById(id: string): Promise<Payer> {
    const payer = await this.payerRepository.findById(id);
    if (!payer) {
      throw new NotFoundError('Pagador não encontrado');
    }
    return payer;
  }

  async findDefaultPayer(): Promise<Payer | null> {
    return this.payerRepository.findDefaultPayer();
  }

  async findAll(): Promise<Payer[]> {
    return this.payerRepository.findAll();
  }

  async update(id: string, data: UpdatePayerDto): Promise<Payer> {
    return this.payerRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.payerRepository.delete(id);
  }
}
