import { Request, Router } from 'express';
import { GroupController } from '../controllers/GroupController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreateGroupSchema,
  GroupParamsDto,
  GroupParamsSchema,
  UpdateGroupSchema
} from '../shared/dtos/group.dto';
import { container } from '../shared/container';

const groupRoutes = Router();
const groupController = container.resolve(GroupController);

groupRoutes.post(
  '/',
  validateBody(CreateGroupSchema),
  (req, res, next) => groupController.create(req, res).catch(next)
);

groupRoutes.get(
  '/',
  (req, res, next) => groupController.findAll(req, res).catch(next)
);

groupRoutes.get(
  '/:id',
  validateParams(GroupParamsSchema),
  (req, res, next) => groupController.findById(req as Request<GroupParamsDto>, res).catch(next)
);

groupRoutes.put(
  '/:id',
  validateParams(GroupParamsSchema),
  validateBody(UpdateGroupSchema),
  (req, res, next) => groupController.update(req as Request<GroupParamsDto>, res).catch(next)
);

groupRoutes.delete(
  '/:id',
  validateParams(GroupParamsSchema),
  (req, res, next) => groupController.delete(req as Request<GroupParamsDto>, res).catch(next)
);

export { groupRoutes };
