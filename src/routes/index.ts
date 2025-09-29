import { Router } from 'express';
import { familyRoutes } from './family.routes';
import { userRoutes } from './user.routes';
import { accountRoutes } from './account.routes';
import { groupBalanceRoutes } from './groupBalance.routes';
import { payerRoutes } from './payer.routes';
import { transactionRoutes } from './transaction.routes';
import { integrationTransactionRoutes } from './integration.routes';
import { monthlyClosureRoutes } from './monthlyClosure.routes';
import { monthlyClosureProcessorRoutes } from './monthlyClosureProcessor.routes';
import { reportRoutes } from './report.routes';

const routes = Router();

routes.use('/families', familyRoutes);
routes.use('/users', userRoutes);
routes.use('/accounts', accountRoutes);
routes.use('/balances', groupBalanceRoutes);
routes.use('/payers', payerRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/integrations', integrationTransactionRoutes);
routes.use('/monthly-closures', monthlyClosureRoutes);
routes.use('/monthly-processor', monthlyClosureProcessorRoutes);
routes.use('/reports', reportRoutes)

export { routes };
