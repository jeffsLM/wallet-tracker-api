import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAccountService } from '../services/interfaces/IAccountService';
import { CreateAccountDto, UpdateAccountDto, AccountParamsDto, AccountByFamilyParamsDto } from '../shared/dtos/account.dto';

@injectable()
export class AccountController {
  constructor(
    @inject('AccountService')
    private accountService: IAccountService
  ) { }

  async create(req: Request<{}, {}, CreateAccountDto>, res: Response) {
    try {

      const active = req.body.active;
      const familyId = req.body.familyId;
      const last4Digits = req.body.last4Digits;
      const name = req.body.name;
      const type = req.body.type;
      const groupId = req.body.groupId

      const account = await this.accountService.create({
        active,
        familyId,
        last4Digits,
        name,
        type,
        groupId
      });

      res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso',
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<AccountParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const account = await this.accountService.findById(id);

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      throw error;
    }
  }

  async findByFamilyId(req: Request<AccountByFamilyParamsDto>, res: Response) {
    try {
      const { familyId } = req.params;
      const accounts = await this.accountService.findByFamilyId(familyId);

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const accounts = await this.accountService.findAll();

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<AccountParamsDto, {}, UpdateAccountDto>, res: Response) {
    try {
      const { id } = req.params;

      const active = req.body.active;
      const last4Digits = req.body.last4Digits;
      const name = req.body.name;
      const type = req.body.type;

      const account = await this.accountService.update(id, {
        active,
        last4Digits,
        name,
        type,
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

  async delete(req: Request<AccountParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.accountService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
