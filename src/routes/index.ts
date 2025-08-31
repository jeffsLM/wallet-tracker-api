import { Router } from 'express';
import { familyRoutes } from './family.routes';
import { userRoutes } from './user.routes';
import { accountRoutes } from './account.routes';
import { accountBalanceRoutes } from './accountBalance.routes';
import { payerRoutes } from './payer.routes';
import { transactionRoutes } from './transaction.routes';
import { integrationTrasactionRoutes } from './integration.routes';

const routes = Router();

routes.use('/families', familyRoutes);
routes.use('/users', userRoutes);
routes.use('/accounts', accountRoutes);
routes.use('/balances', accountBalanceRoutes);
routes.use('/payers', payerRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/integrations', integrationTrasactionRoutes);

export { routes };
