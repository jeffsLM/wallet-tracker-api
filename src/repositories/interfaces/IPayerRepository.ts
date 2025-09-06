import { Payer } from '@prisma/client';
import { CreatePayerDto, UpdatePayerDto } from '../../shared/dtos/payer.dto';

export interface IPayerRepository {
  create(data: CreatePayerDto): Promise<Payer>;
  findById(id: string): Promise<Payer | null>;
  findDefaultPayer(): Promise<Payer | null>;
  findAll(): Promise<Payer[]>;
  findByName(name: string): Promise<Payer | null>;
  update(id: string, data: UpdatePayerDto): Promise<Payer>;
  delete(id: string): Promise<void>;
}
