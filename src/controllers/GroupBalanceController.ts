import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GroupBalanceParamsDto, CreateGroupBalanceDto, UpdateGroupBalanceDto } from '../shared/dtos/groupBalance.dto';
import { IGroupBalanceRepository } from '../repositories/interfaces/IGroupBalanceRepository';

@injectable()
export class GroupBalanceController {
  constructor(
    @inject('GroupBalanceRepository')
    private groupBalanceRepository: IGroupBalanceRepository
  ) { }

  async create(req: Request<{}, {}, CreateGroupBalanceDto>, res: Response) {
    try {

      const groupId = req.body.groupId;
      const amount = req.body.amount;
      const competence = req.body.competence;

      const account = await this.groupBalanceRepository.create({
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

  async findById(req: Request<GroupBalanceParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const account = await this.groupBalanceRepository.findById(id);

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
      const accounts = await this.groupBalanceRepository.findAll();

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<GroupBalanceParamsDto, {}, UpdateGroupBalanceDto>, res: Response) {
    try {
      const { id } = req.params;

      const amount = req.body.amount;
      const competence = req.body.competence;

      const account = await this.groupBalanceRepository.update(id, {
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

  async delete(req: Request<GroupBalanceParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.groupBalanceRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
