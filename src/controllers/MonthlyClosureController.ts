import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IMonthlyClosureService } from '../services/interfaces/IMonthlyClosureService';
import { CreateMonthlyClosureDto, UpdateMonthlyClosureDto, MonthlyClosureByFamilyParamsDto, MonthlyClosureParamsDto } from '../shared/dtos/monthlyClosure.dto';

@injectable()
export class MonthlyClosureController {
  constructor(
    @inject('MonthlyClosureService')
    private monthlyClosureService: IMonthlyClosureService
  ) { }

  async create(req: Request<{}, {}, CreateMonthlyClosureDto>, res: Response) {
    try {

      const competence = req.body.competence;
      const familyId = req.body.familyId;

      const monthlyClosure = await this.monthlyClosureService.create({
        familyId,
        competence
      });

      res.status(201).json({
        success: true,
        message: 'Fechamento do mês criado com sucesso',
        data: monthlyClosure
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<MonthlyClosureParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const monthlyClosure = await this.monthlyClosureService.findById(id);

      res.json({
        success: true,
        data: monthlyClosure
      });
    } catch (error) {
      throw error;
    }
  }

  async findByFamilyId(req: Request<MonthlyClosureByFamilyParamsDto>, res: Response) {
    try {
      const { familyId } = req.params;
      const monthlyClosure = await this.monthlyClosureService.findByFamilyId(familyId);

      res.json({
        success: true,
        data: monthlyClosure
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const monthlyClosure = await this.monthlyClosureService.findAll();

      res.json({
        success: true,
        data: monthlyClosure
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<MonthlyClosureParamsDto, {}, UpdateMonthlyClosureDto>, res: Response) {
    try {
      const { id } = req.params;

      const competence = req.body?.competence;
      const status = req.body?.status;
      const totalExpenses = req.body?.totalExpenses;
      const initialBalance = req.body?.initialBalance;

      const monthlyClosure = await this.monthlyClosureService.update(id, {
        competence,
        status,
        totalExpenses,
        initialBalance
      });

      res.json({
        success: true,
        message: 'Fechamento do mês atualizada com sucesso',
        data: monthlyClosure
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<MonthlyClosureParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.monthlyClosureService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
