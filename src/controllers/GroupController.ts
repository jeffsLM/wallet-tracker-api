import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateGroupDto, UpdateGroupDto, GroupParamsDto } from '../shared/dtos/group.dto';
import { IGroupService } from '../services/interfaces/IGroupService';

@injectable()
export class GroupController {
  constructor(
    @inject('GroupService')
    private groupService: IGroupService
  ) { }

  async create(req: Request<{}, {}, CreateGroupDto>, res: Response) {
    try {
      const name = req.body.name;

      const account = await this.groupService.create({
        name
      });

      res.status(201).json({
        success: true,
        message: 'Grupo criado com sucesso',
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<GroupParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const account = await this.groupService.findById(id);

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
      const accounts = await this.groupService.findAll();

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<GroupParamsDto, {}, UpdateGroupDto>, res: Response) {
    try {
      const { id } = req.params;

      const name = req.body.name;
      const account = await this.groupService.update(id, {
        name
      });

      res.json({
        success: true,
        message: 'Conta atualizada com sucesso',
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<GroupParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.groupService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
