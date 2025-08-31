import { Request, Router } from 'express';
import { container } from '../shared/container';
import { TransactionController } from '../controllers/TransactionController';
import { validateBody, validateParams, validateQuery } from '../shared/middlewares/validation.middleware';
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionParamsSchema,
  TransactionByAccountParamsSchema,
  TransactionQuerySchema,
  CreateTransactionDto,
  TransactionParamsDto,
  TransactionByAccountParamsDto
} from '../shared/dtos/transaction.dto';

const transactionRoutes = Router();
const transactionController = container.resolve(TransactionController);

transactionRoutes.post(
  '/',
  validateBody(CreateTransactionSchema),
  (req, res, next) => transactionController.create(req, res, next).catch(next)
);

transactionRoutes.get(
  '/',
  validateQuery(TransactionQuerySchema),
  (req, res, next) => transactionController.findWithFilters(req, res, next).catch(next)
);

transactionRoutes.get(
  '/all',
  (req, res, next) => transactionController.findAll(req, res, next).catch(next)
);

transactionRoutes.get(
  '/:id',
  validateParams(TransactionParamsSchema),
  (req, res, next) => transactionController.findById(req as Request<TransactionParamsDto>, res, next).catch(next)
);

transactionRoutes.get(
  '/account/:accountId',
  validateParams(TransactionByAccountParamsSchema),
  (req, res, next) => transactionController.findByAccountId(req as Request<TransactionByAccountParamsDto>, res, next).catch(next)
);

transactionRoutes.put(
  '/:id',
  validateParams(TransactionParamsSchema),
  validateBody(UpdateTransactionSchema),
  (req, res, next) => transactionController.update(req as Request<TransactionParamsDto>, res, next).catch(next)
);

transactionRoutes.delete(
  '/:id',
  validateParams(TransactionParamsSchema),
  (req, res, next) => transactionController.delete(req as Request<TransactionParamsDto>, res, next).catch(next)
);

export { transactionRoutes };
