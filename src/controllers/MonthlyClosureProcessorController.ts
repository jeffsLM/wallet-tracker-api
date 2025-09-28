import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { MonthlyClosureProcessorDto } from '../shared/dtos/monthlyClosureProcessorService.dto';
import { IMonthlyClosureProcessorService } from '../services/interfaces/IMonthlyClosureProcessorService';

@injectable()
export class MonthlyClosureProcessorController {
  constructor(
    @inject('MonthlyClosureProcessorService')
    private monthlyClosureProcessorService: IMonthlyClosureProcessorService
  ) { }

  async handle(req: Request<{}, {}, MonthlyClosureProcessorDto>, res: Response) {
    try {

      await this.monthlyClosureProcessorService.create({ id: req.body.id });

      return res.status(200).json({
        success: true,
        message: 'Fechamento realizado com sucesso',
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Problemas ao realizar o fechamento',
        message: error.message
      });
    }
  }
}
