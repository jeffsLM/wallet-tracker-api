import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '../services/interfaces/IUserService';
import { CreateUserDto, UpdateUserDto, UserParamsDto, UserByFamilyParamsDto } from '../shared/dtos/user.dto';

@injectable()
export class UserController {
  constructor(
    @inject('UserService')
    private userService: IUserService
  ) { }

  async create(req: Request<{}, {}, CreateUserDto>, res: Response) {
    try {
      const user = await this.userService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<UserParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      throw error;
    }
  }

  async findByFamilyId(req: Request<UserByFamilyParamsDto>, res: Response) {
    try {
      const { familyId } = req.params;
      const users = await this.userService.findByFamilyId(familyId);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<UserParamsDto, {}, UpdateUserDto>, res: Response) {
    try {
      const { id } = req.params;
      const name = req.body.name;
      const phone = req.body.phone;
      const user = await this.userService.update(id, {
        name,
        phone
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<UserParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.userService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
