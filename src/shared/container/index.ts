// src/shared/container/index.ts
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Repositories
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { FamilyRepository } from '../../repositories/implementations/FamilyRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { UserRepository } from '../../repositories/implementations/UserRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { AccountBalanceRepository } from '../../repositories/implementations/AccountBalanceRepository';
import { IAccountBalanceRepository } from '../../repositories/interfaces/IAccountBalanceRepository';
import { AccountRepository } from '../../repositories/implementations/AccountRepository';
import { IPayerRepository } from '../../repositories/interfaces/IPayerRepository';
import { PayerRepository } from '../../repositories/implementations/PayerRepository';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { TransactionRepository } from '../../repositories/implementations/TransactionRepository';

// Services
import { IFamilyService } from '../../services/interfaces/IFamilyService';
import { FamilyService } from '../../services/implementations/FamilyService';
import { IUserService } from '../../services/interfaces/IUserService';
import { UserService } from '../../services/implementations/UserService';
import { IAccountBalanceService } from '../../services/interfaces/IAccountBalanceService';
import { AccountBalanceService } from '../../services/implementations/AccountBalanceService';
import { IAccountService } from '../../services/interfaces/IAccountService';
import { AccountService } from '../../services/implementations/AccountService';
import { IPayerService } from '../../services/interfaces/IPayerService';
import { PayerService } from '../../services/implementations/PayerService';
import { ITransactionService } from '../../services/interfaces/ITransactionService';
import { TransactionService } from '../../services/implementations/TransactionService';

// Configuração do Prisma Client
const prisma = new PrismaClient();

// Registrar Prisma Client
container.registerInstance('PrismaClient', prisma);

// Registrar Repositories
container.register<IFamilyRepository>(
  'FamilyRepository',
  { useClass: FamilyRepository }
);

container.register<IUserRepository>(
  'UserRepository',
  { useClass: UserRepository }
);

container.register<IAccountRepository>(
  'AccountRepository',
  { useClass: AccountRepository }
);

container.register<IAccountBalanceRepository>(
  'AccountBalanceRepository',
  { useClass: AccountBalanceRepository }
);

container.register<IPayerRepository>(
  'PayerRepository',
  { useClass: PayerRepository }
);

container.register<ITransactionRepository>(
  'TransactionRepository',
  { useClass: TransactionRepository }
);

// Registrar Services
container.register<IFamilyService>(
  'FamilyService',
  { useClass: FamilyService }
);

container.register<IUserService>(
  'UserService',
  { useClass: UserService }
);

container.register<IAccountService>(
  'AccountService',
  { useClass: AccountService }
);

container.register<IAccountBalanceService>(
  'AccountBalanceService',
  { useClass: AccountBalanceService }
);

container.register<IPayerService>(
  'PayerService',
  { useClass: PayerService }
);

container.register<ITransactionService>(
  'TransactionService',
  { useClass: TransactionService }
);

export { container, prisma };
