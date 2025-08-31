import { Router } from 'express';
import { IntegrationTrasaction } from '../controllers/IntegrationTrasaction';
import { validateBody } from '../shared/middlewares/validation.middleware';
import {
  WhatsappPluginTransactionSchema,
} from '../shared/dtos/transactionWhatsappPlugin.dto';
import { container } from '../shared/container';

const integrationTrasactionRoutes = Router();
const integrationTrasaction = container.resolve(IntegrationTrasaction);

integrationTrasactionRoutes.post(
  '/whatsapp-plugin',
  validateBody(WhatsappPluginTransactionSchema),
  (req, res, next) => integrationTrasaction.handle(req, res).catch(next)
);

export { integrationTrasactionRoutes };
