// src/shared/container/index.ts
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Repositories
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { FamilyRepository } from '../../repositories/implementations/FamilyRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { UserRepository } from '../../repositories/implementations/UserRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { GroupBalanceRepository } from '../../repositories/implementations/GroupBalanceRepository';
import { IGroupBalanceRepository } from '../../repositories/interfaces/IGroupBalanceRepository';
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
import { IGroupBalanceService } from '../../services/interfaces/IGroupBalanceService';
import { GroupBalanceService } from '../../services/implementations/GroupBalanceService';
import { IAccountService } from '../../services/interfaces/IAccountService';
import { AccountService } from '../../services/implementations/AccountService';
import { IPayerService } from '../../services/interfaces/IPayerService';
import { PayerService } from '../../services/implementations/PayerService';
import { ITransactionService } from '../../services/interfaces/ITransactionService';
import { TransactionService } from '../../services/implementations/TransactionService';
import { ITransactionWhatsappService } from '../../services/interfaces/ITrasactionWhatsappService';
import { TransactionWhatsappService } from '../../services/implementations/TransactionWhatsappService';
import { IGroupRepository } from '../../repositories/interfaces/IGroupRepository';
import { GroupRepository } from '../../repositories/implementations/GroupRepository';
import { IGroupService } from '../../services/interfaces/IGroupService';
import { GroupService } from '../../services/implementations/GroupService';
import { MonthlyClosureRepository } from '../../repositories/implementations/MonthlyClosureRepository';
import { IMonthlyClosureRepository } from '../../repositories/interfaces/IMonthlyClosureRepository';
import { IMonthlyClosureService } from '../../services/interfaces/IMonthlyClosureService';
import { MonthlyClosureService } from '../../services/implementations/MonthlyClosureService';
import { MonthlyClosureProcessorService } from '../../services/implementations/MonthlyClosureProcessorService';
import { IMonthlyClosureProcessorService } from '../../services/interfaces/IMonthlyClosureProcessorService';
import { ReportService } from '../../services/implementations/ReportService';
import { IReportService } from '../../services/interfaces/IReportService';

const prisma = new PrismaClient();
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

container.register<IGroupRepository>(
  'GroupRepository',
  { useClass: GroupRepository }
);

container.register<IGroupBalanceRepository>(
  'GroupBalanceRepository',
  { useClass: GroupBalanceRepository }
);

container.register<IPayerRepository>(
  'PayerRepository',
  { useClass: PayerRepository }
);

container.register<ITransactionRepository>(
  'TransactionRepository',
  { useClass: TransactionRepository }
);

container.register<IMonthlyClosureRepository>(
  'MonthlyClosureRepository',
  { useClass: MonthlyClosureRepository }
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

container.register<IGroupService>(
  'GroupService',
  { useClass: GroupService }
);

container.register<IGroupBalanceService>(
  'GroupBalanceService',
  { useClass: GroupBalanceService }
);

container.register<IPayerService>(
  'PayerService',
  { useClass: PayerService }
);

container.register<ITransactionService>(
  'TransactionService',
  { useClass: TransactionService }
);

container.register<ITransactionWhatsappService>(
  'TransactionWhatsappService',
  { useClass: TransactionWhatsappService }
);

container.register<IMonthlyClosureService>(
  'MonthlyClosureService',
  { useClass: MonthlyClosureService }
);

container.register<IMonthlyClosureProcessorService>(
  'MonthlyClosureProcessorService',
  { useClass: MonthlyClosureProcessorService }
);

container.register<IReportService>(
  'ReportService',
  { useClass: ReportService }
);

export { container, prisma };
