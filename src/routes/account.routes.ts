import { Request, Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountParamsSchema,
  AccountByFamilyParamsSchema,
  AccountParamsDto,
  AccountByFamilyParamsDto
} from '../shared/dtos/account.dto';
import { container } from '../shared/container';

const accountRoutes = Router();
const accountController = container.resolve(AccountController);

accountRoutes.post(
  '/',
  validateBody(CreateAccountSchema),
  (req, res, next) => accountController.create(req, res).catch(next)
);

accountRoutes.get(
  '/',
  (req, res, next) => accountController.findAll(req, res).catch(next)
);

accountRoutes.get(
  '/:id',
  validateParams(AccountParamsSchema),
  (req, res, next) => accountController.findById(req as Request<AccountParamsDto>, res).catch(next)
);

accountRoutes.get(
  '/family/:familyId',
  validateParams(AccountByFamilyParamsSchema),
  (req, res, next) => accountController.findByFamilyId(req as Request<AccountByFamilyParamsDto>, res).catch(next)
);

accountRoutes.put(
  '/:id',
  validateParams(AccountParamsSchema),
  validateBody(UpdateAccountSchema),
  (req, res, next) => accountController.update(req as Request<AccountParamsDto>, res).catch(next)
);

accountRoutes.delete(
  '/:id',
  validateParams(AccountParamsSchema),
  (req, res, next) => accountController.delete(req as Request<AccountParamsDto>, res).catch(next)
);

export { accountRoutes };
