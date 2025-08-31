import { Request, Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  UpdateBalanceSchema,
  BalanceParamsSchema,
  BalanceParamsDto,
} from '../shared/dtos/accountBalance.dto';
import { container } from '../shared/container';

const accountBalanceRoutes = Router();
const accountController = container.resolve(AccountController);

accountBalanceRoutes.post(
  '/',
  validateBody(BalanceParamsSchema),
  (req, res, next) => accountController.create(req, res).catch(next)
);

accountBalanceRoutes.get(
  '/all',
  (req, res, next) => accountController.findAll(req, res).catch(next)
);

accountBalanceRoutes.get(
  '/:id',
  validateParams(BalanceParamsSchema),
  (req, res, next) => accountController.findById(req as Request<BalanceParamsDto>, res).catch(next)
);

accountBalanceRoutes.put(
  '/:id',
  validateParams(BalanceParamsSchema),
  validateBody(UpdateBalanceSchema),
  (req, res, next) => accountController.update(req as Request<BalanceParamsDto>, res).catch(next)
);

accountBalanceRoutes.delete(
  '/:id',
  validateParams(BalanceParamsSchema),
  (req, res, next) => accountController.delete(req as Request<BalanceParamsDto>, res).catch(next)
);

export { accountBalanceRoutes };
