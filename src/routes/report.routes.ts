import { Router } from 'express';
import { validateBody } from '../shared/middlewares/validation.middleware';
import {
  ReportParamsByPeriodSchema,
  ReportParamsByCompetenceSchema
} from '../shared/dtos/report.dto';
import { container } from '../shared/container';
import { ReportController } from '../controllers/ReportController';

const reportRoutes = Router();
const reportController = container.resolve(ReportController);

reportRoutes.post(
  '/expanses-overview-payer',
  validateBody(ReportParamsByCompetenceSchema),
  (req, res, next) => reportController.expansesOverviewByPayer(req, res).catch(next)
);

reportRoutes.post(
  '/expanses-overview-period',
  validateBody(ReportParamsByPeriodSchema),
  (req, res, next) => reportController.expansesOverviewByPeriod(req, res).catch(next)
);

reportRoutes.post(
  '/expanses-overview-period-and-payer',
  validateBody(ReportParamsByPeriodSchema),
  (req, res, next) => reportController.expansesOverviewByPeriodAndPayer(req, res).catch(next)
);

reportRoutes.post(
  '/expanses-overview',
  validateBody(ReportParamsByCompetenceSchema),
  (req, res, next) => reportController.expensesOverview(req, res).catch(next)
);

reportRoutes.post(
  '/overflow-to-credit',
  validateBody(ReportParamsByCompetenceSchema),
  (req, res, next) => reportController.overflowToCredit(req, res).catch(next)
);

export { reportRoutes };
