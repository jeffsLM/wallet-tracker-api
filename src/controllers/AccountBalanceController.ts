import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { BalanceParamsDto, CreateBalanceDto, UpdateBalanceDto } from '../shared/dtos/accountBalance.dto';
import { IAccountBalanceRepository } from '../repositories/interfaces/IAccountBalanceRepository';

@injectable()
export class AccountBalanceController {
  constructor(
    @inject('accountBalanceRepository')
    private accountBalanceRepository: IAccountBalanceRepository
  ) { }

  async create(req: Request<{}, {}, CreateBalanceDto>, res: Response) {
    try {

      const groupId = req.body.groupId;
      const amount = req.body.amount;
      const competence = req.body.competence;

      const account = await this.accountBalanceRepository.create({
        groupId,
        amount,
        competence
      });

      res.status(201).json({
        success: true,
        message: 'Saldo criado com sucesso',
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<BalanceParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const account = await this.accountBalanceRepository.findById(id);

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const accounts = await this.accountBalanceRepository.findAll();

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<BalanceParamsDto, {}, UpdateBalanceDto>, res: Response) {
    try {
      const { id } = req.params;

      const amount = req.body.amount;
      const competence = req.body.competence;

      const account = await this.accountBalanceRepository.update(id, {
        amount,
        competence
      });

      res.json({
        success: true,
        message: 'Saldo atualizado com sucesso',
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<BalanceParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.accountBalanceRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
