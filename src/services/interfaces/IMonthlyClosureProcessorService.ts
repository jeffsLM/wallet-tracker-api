import { MonthlyClosureProcessorDto } from '../../shared/dtos/monthlyClosureProcessorService.dto';

export interface IMonthlyClosureProcessorService {
  create(data: MonthlyClosureProcessorDto): Promise<void>;
}
