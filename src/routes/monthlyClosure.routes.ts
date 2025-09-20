import { Request, Router } from 'express';
import { MonthlyClosureController } from '../controllers/MonthlyClosureController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreateMonthlyClosureSchema,
  MonthlyClosureByFamilyParamsDto,
  MonthlyClosureByFamilyParamsSchema,
  MonthlyClosureParamsDto,
  MonthlyClosureParamsSchema,
  UpdateMonthlyClosureSchema
} from '../shared/dtos/monthlyClosure.dto';
import { container } from '../shared/container';

const monthlyClosureRoutes = Router();
const accountController = container.resolve(MonthlyClosureController);

monthlyClosureRoutes.post(
  '/',
  validateBody(CreateMonthlyClosureSchema),
  (req, res, next) => accountController.create(req, res).catch(next)
);

monthlyClosureRoutes.get(
  '/',
  (req, res, next) => accountController.findAll(req, res).catch(next)
);

monthlyClosureRoutes.get(
  '/:id',
  validateParams(MonthlyClosureParamsSchema),
  (req, res, next) => accountController.findById(req as Request<MonthlyClosureParamsDto>, res).catch(next)
);

monthlyClosureRoutes.get(
  '/family/:familyId',
  validateParams(MonthlyClosureByFamilyParamsSchema),
  (req, res, next) => accountController.findByFamilyId(req as Request<MonthlyClosureByFamilyParamsDto>, res).catch(next)
);

monthlyClosureRoutes.put(
  '/:id',
  validateParams(MonthlyClosureParamsSchema),
  validateBody(UpdateMonthlyClosureSchema),
  (req, res, next) => accountController.update(req as Request<MonthlyClosureParamsDto>, res).catch(next)
);

monthlyClosureRoutes.delete(
  '/:id',
  validateParams(MonthlyClosureParamsSchema),
  (req, res, next) => accountController.delete(req as Request<MonthlyClosureParamsDto>, res).catch(next)
);

export { monthlyClosureRoutes };
