// src/controllers/TransactionController.ts
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITransactionService } from '../services/interfaces/ITransactionService';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionParamsDto,
  TransactionByAccountParamsDto,
  TransactionQueryDto
} from '../shared/dtos/transaction.dto';

@injectable()
export class TransactionController {
  constructor(
    @inject('TransactionService')
    private transactionService: ITransactionService
  ) { }

  async create(req: Request<{}, {}, CreateTransactionDto>, res: Response, next: NextFunction): Promise<void> {
    try {

      const accountId = req.body.accountId;
      const accountingPeriod = req.body.accountingPeriod;
      const amount = req.body.amount;
      const description = req.body.description;
      const operationType = req.body.operationType;
      const finalInstallment = req.body.finalInstallment;
      const installment = req.body.installment;
      const ocr = req.body.ocr;
      const payerId = req.body.payerId;
      const status = req.body.status;
      const userId = req.body.userId;

      const transaction = await this.transactionService.create({
        accountId,
        accountingPeriod,
        amount,
        description,
        operationType,
        finalInstallment,
        installment,
        ocr,
        payerId,
        status,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Transação criada com sucesso',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request<TransactionParamsDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.findById(id);

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async findByAccountId(req: Request<TransactionByAccountParamsDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.params;
      const transactions = await this.transactionService.findByAccountId(accountId);

      res.json({
        success: true,
        data: transactions,
        total: transactions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async findWithFilters(req: Request<{}, {}, {}, TransactionQueryDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.transactionService.findWithFilters(req.query);

      res.json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: req.query.limit || 50,
          offset: req.query.offset || 0,
          hasNextPage: result.page < result.totalPages,
          hasPreviousPage: result.page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }


  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await this.transactionService.findAll();

      res.json({
        success: true,
        data: transactions,
        total: transactions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request<TransactionParamsDto, {}, UpdateTransactionDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const accountingPeriod = req.body.accountingPeriod;
      const amount = req.body.amount;
      const description = req.body.description;
      const operationType = req.body.operationType;
      const finalInstallment = req.body.finalInstallment;
      const installment = req.body.installment;
      const ocr = req.body.ocr;
      const payerId = req.body.payerId;
      const status = req.body.status;
      const userId = req.body.userId;

      const transaction = await this.transactionService.update(id, {
        accountingPeriod,
        amount,
        description,
        operationType,
        finalInstallment,
        installment,
        ocr,
        payerId,
        status,
        userId
      });

      res.json({
        success: true,
        message: 'Transação atualizada com sucesso',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }


  async delete(req: Request<TransactionParamsDto>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.transactionService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request<{}, {}, {}, Partial<TransactionQueryDto>>, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;

      // Buscar todas as transações com os filtros aplicados
      const result = await this.transactionService.findWithFilters({
        ...filters,
        limit: 1000, // Limite alto para calcular estatísticas
        offset: 0
      });

      const transactions = result.transactions;

      // Calcular estatísticas
      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      // Agrupar por tipo de operação
      const operationTypes = transactions.reduce((acc, t) => {
        acc[t.operationType] = (acc[t.operationType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Agrupar por status
      const statuses = transactions.reduce((acc, t) => {
        const status = t.status || 'sem_status';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Agrupar por conta
      const accountStats = transactions.reduce((acc, t) => {
        const accountName = t.account.name;
        if (!acc[accountName]) {
          acc[accountName] = {
            count: 0,
            totalAmount: 0,
            accountType: t.account.type
          };
        }
        acc[accountName].count += 1;
        acc[accountName].totalAmount += Number(t.amount);
        return acc;
      }, {} as Record<string, { count: number; totalAmount: number; accountType: string }>);

      // Transações mais recentes (últimas 5)
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          operationType: t.operationType,
          accountName: t.account.name,
          createAt: t.createAt
        }));

      res.json({
        success: true,
        data: {
          summary: {
            totalTransactions,
            totalAmount: Number(totalAmount.toFixed(2)),
            averageAmount: Number(averageAmount.toFixed(2))
          },
          operationTypes,
          statuses,
          accountStats,
          recentTransactions,
          period: {
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
