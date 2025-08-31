import { Request, Router } from 'express';
import { container } from '../shared/container';
import { FamilyController } from '../controllers/FamilyController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreateFamilySchema,
  UpdateFamilySchema,
  FamilyParamsSchema,
  FamilyParamsDto
} from '../shared/dtos/family.dto';

const familyRoutes = Router();
const familyController = container.resolve(FamilyController);

familyRoutes.post(
  '/',
  validateBody(CreateFamilySchema),
  (req, res, next) => familyController.create(req, res).catch(next)
);

familyRoutes.get(
  '/',
  (req, res, next) => familyController.findAll(req, res).catch(next)
);

familyRoutes.get(
  '/:id',
  validateParams(FamilyParamsSchema),
  (req, res, next) => familyController.findById(req as Request<FamilyParamsDto>, res).catch(next)
);

familyRoutes.get(
  '/:id/users',
  validateParams(FamilyParamsSchema),
  (req, res, next) => familyController.findByIdWithUsers(req as Request<FamilyParamsDto>, res).catch(next)
);

familyRoutes.get(
  '/:id/accounts',
  validateParams(FamilyParamsSchema),
  (req, res, next) => familyController.findByIdWithAccounts(req as Request<FamilyParamsDto>, res).catch(next)
);

familyRoutes.put(
  '/:id',
  validateParams(FamilyParamsSchema),
  validateBody(UpdateFamilySchema),
  (req, res, next) => familyController.update(req as Request<FamilyParamsDto>, res).catch(next)
);

familyRoutes.delete(
  '/:id',
  validateParams(FamilyParamsSchema),
  (req, res, next) => familyController.delete(req as Request<FamilyParamsDto>, res).catch(next)
);

export { familyRoutes };
