import { Router } from 'express';
import { MonthlyClosureProcessorController } from '../controllers/MonthlyClosureProcessorController';
import { validateBody } from '../shared/middlewares/validation.middleware';
import {
  MonthlyClosureProcessorSchema,
} from '../shared/dtos/monthlyClosureProcessorService.dto';
import { container } from '../shared/container';

const monthlyClosureProcessorRoutes = Router();
const monthlyClosureProcessorController = container.resolve(MonthlyClosureProcessorController);

monthlyClosureProcessorRoutes.post(
  '/',
  validateBody(MonthlyClosureProcessorSchema),
  (req, res, next) => monthlyClosureProcessorController.handle(req, res).catch(next)
);

export { monthlyClosureProcessorRoutes };
