import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ReportParamsByPeriodDto, ReportParamsByCompetenceDto } from '../shared/dtos/report.dto';
import { IReportService } from '../services/interfaces/IReportService';

@injectable()
export class ReportController {
  constructor(
    @inject('ReportService')
    private reportService: IReportService
  ) { }

  async overflowToCredit(req: Request<{}, {}, ReportParamsByCompetenceDto>, res: Response) {
    try {
      const date = req.body.date;
      const accountType = req.body.accountType;

      const report = await this.reportService.overflowToCredit({
        date, accountType
      });

      res.status(200).json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  async expensesOverview(req: Request<{}, {}, ReportParamsByCompetenceDto>, res: Response) {
    try {
      const date = req.body.date;

      const report = await this.reportService.expensesOverview({
        date
      });

      res.status(200).json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }


  async expansesOverviewByPeriodAndPayer(req: Request<{}, {}, ReportParamsByPeriodDto>, res: Response) {
    try {
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const report = await this.reportService.expansesOverviewByPeriodAndPayer({
        startDate,
        endDate
      });

      res.status(200).json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  async expansesOverviewByPeriod(req: Request<{}, {}, ReportParamsByPeriodDto>, res: Response) {
    try {
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const report = await this.reportService.expansesOverviewByPeriod({
        startDate,
        endDate
      });

      res.status(200).json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }

  async expansesOverviewByPayer(req: Request<{}, {}, ReportParamsByCompetenceDto>, res: Response) {
    try {
      const date = req.body.date;
      const accountType = req.body.accountType;

      const report = await this.reportService.expansesOverviewByPayer({
        date, accountType
      });

      res.status(200).json({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: report
      });
    } catch (error) {
      throw error;
    }
  }
}
