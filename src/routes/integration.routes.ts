import { Router } from 'express';
import { IntegrationTransaction } from '../controllers/IntegrationTransaction';
import { validateBody } from '../shared/middlewares/validation.middleware';
import {
  WhatsappPluginTransactionSchema,
} from '../shared/dtos/transactionWhatsappPlugin.dto';
import { container } from '../shared/container';

const integrationTransactionRoutes = Router();
const integrationTransaction = container.resolve(IntegrationTransaction);

integrationTransactionRoutes.post(
  '/whatsapp-plugin',
  validateBody(WhatsappPluginTransactionSchema),
  (req, res, next) => integrationTransaction.handle(req, res).catch(next)
);

export { integrationTransactionRoutes };
