import { Request, Router } from 'express';
import { GroupBalanceController } from '../controllers/GroupBalanceController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  UpdateGroupBalanceSchema,
  GroupBalanceParamsSchema,
  GroupBalanceParamsDto,
} from '../shared/dtos/groupBalance.dto';
import { container } from '../shared/container';

const groupBalanceRoutes = Router();
const groupBalanceController = container.resolve(GroupBalanceController);

groupBalanceRoutes.post(
  '/',
  validateBody(GroupBalanceParamsSchema),
  (req, res, next) => groupBalanceController.create(req, res).catch(next)
);

groupBalanceRoutes.get(
  '/all',
  (req, res, next) => groupBalanceController.findAll(req, res).catch(next)
);

groupBalanceRoutes.get(
  '/:id',
  validateParams(GroupBalanceParamsSchema),
  (req, res, next) => groupBalanceController.findById(req as Request<GroupBalanceParamsDto>, res).catch(next)
);

groupBalanceRoutes.put(
  '/:id',
  validateParams(GroupBalanceParamsSchema),
  validateBody(UpdateGroupBalanceSchema),
  (req, res, next) => groupBalanceController.update(req as Request<GroupBalanceParamsDto>, res).catch(next)
);

groupBalanceRoutes.delete(
  '/:id',
  validateParams(GroupBalanceParamsSchema),
  (req, res, next) => groupBalanceController.delete(req as Request<GroupBalanceParamsDto>, res).catch(next)
);

export { groupBalanceRoutes };
