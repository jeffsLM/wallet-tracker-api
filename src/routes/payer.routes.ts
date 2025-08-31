import { Request, Router } from 'express';
import { container } from '../shared/container';
import { PayerController } from '../controllers/PayerController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreatePayerSchema,
  UpdatePayerSchema,
  PayerParamsSchema,
  PayerParamsDto
} from '../shared/dtos/payer.dto';

const payerRoutes = Router();
const payerController = container.resolve(PayerController);

payerRoutes.post(
  '/',
  validateBody(CreatePayerSchema),
  (req, res, next) => payerController.create(req, res).catch(next)
);

payerRoutes.get(
  '/',
  (req, res, next) => payerController.findAll(req, res).catch(next)
);

payerRoutes.get(
  '/:id',
  validateParams(PayerParamsSchema),
  (req, res, next) => payerController.findById(req as Request<PayerParamsDto>, res).catch(next)
);

payerRoutes.put(
  '/:id',
  validateParams(PayerParamsSchema),
  validateBody(UpdatePayerSchema),
  (req, res, next) => payerController.update(req as Request<PayerParamsDto>, res).catch(next)
);

payerRoutes.delete(
  '/:id',
  validateParams(PayerParamsSchema),
  (req, res, next) => payerController.delete(req as Request<PayerParamsDto>, res).catch(next)
);

export { payerRoutes };
