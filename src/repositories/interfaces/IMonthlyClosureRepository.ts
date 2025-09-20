import { MonthlyClosure } from '@prisma/client';
import { CreateMonthlyClosureDto, UpdateMonthlyClosureDto } from '../../shared/dtos/monthlyClosure.dto';

export interface IMonthlyClosureRepository {
  create(data: CreateMonthlyClosureDto): Promise<MonthlyClosure>;
  findById(id: string): Promise<MonthlyClosure | null>;
  findByFamilyId(familyId: string): Promise<MonthlyClosure[]>;
  findAll(): Promise<MonthlyClosure[]>;
  update(id: string, data: UpdateMonthlyClosureDto): Promise<MonthlyClosure>;
  delete(id: string): Promise<void>;
}
