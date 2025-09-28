import { Router } from 'express';
import { MonthlyClosureProcessorController } from '../controllers/MonthlyClosureProcessorController';
import { validateBody } from '../shared/middlewares/validation.middleware';
import {
  WhatsappPluginTransactionSchema,
} from '../shared/dtos/transactionWhatsappPlugin.dto';
import { container } from '../shared/container';

const monthlyClosureProcessorRoutes = Router();
const monthlyClosureProcessorController = container.resolve(MonthlyClosureProcessorController);

monthlyClosureProcessorRoutes.post(
  '/',
  validateBody(WhatsappPluginTransactionSchema),
  (req, res, next) => monthlyClosureProcessorController.handle(req, res).catch(next)
);

export { monthlyClosureProcessorRoutes };
