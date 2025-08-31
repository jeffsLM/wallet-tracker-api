import { Request, Router } from 'express';
import { container } from '../shared/container';
import { UserController } from '../controllers/UserController';
import { validateBody, validateParams } from '../shared/middlewares/validation.middleware';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserParamsSchema,
  UserByFamilyParamsSchema,
  UserParamsDto,
  UserByFamilyParamsDto
} from '../shared/dtos/user.dto';
import '../shared/container'

const userRoutes = Router();
const userController = container.resolve(UserController);

// POST /users - Criar usuário
userRoutes.post(
  '/',
  validateBody(CreateUserSchema),
  (req, res, next) => userController.create(req, res).catch(next)
);

// GET /users - Listar todos os usuários
userRoutes.get(
  '/',
  (req, res, next) => userController.findAll(req, res).catch(next)
);

// GET /users/:id - Buscar usuário por ID
userRoutes.get(
  '/:id',
  validateParams(UserParamsSchema),
  (req, res, next) => userController.findById(req as Request<UserParamsDto>, res).catch(next)
);

// GET /families/:familyId/users - Listar usuários por família
userRoutes.get(
  '/family/:familyId',
  validateParams(UserByFamilyParamsSchema),
  (req, res, next) => userController.findByFamilyId(req as Request<UserByFamilyParamsDto>, res).catch(next)
);

// PUT /users/:id - Atualizar usuário
userRoutes.put(
  '/:id',
  validateParams(UserParamsSchema),
  validateBody(UpdateUserSchema),
  (req, res, next) => userController.update(req as Request<UserParamsDto>, res).catch(next)
);

// DELETE /users/:id - Deletar usuário
userRoutes.delete(
  '/:id',
  validateParams(UserParamsSchema),
  (req, res, next) => userController.delete(req as Request<UserParamsDto>, res).catch(next)
);

export { userRoutes };
