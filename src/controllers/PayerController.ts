import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IPayerService } from '../services/interfaces/IPayerService';
import { CreatePayerDto, UpdatePayerDto, PayerParamsDto } from '../shared/dtos/payer.dto';

@injectable()
export class PayerController {
  constructor(
    @inject('PayerService')
    private payerService: IPayerService
  ) { }

  async create(req: Request<{}, {}, CreatePayerDto>, res: Response) {
    try {
      const payer = await this.payerService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Pagador criado com sucesso',
        data: payer
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request<PayerParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      const payer = await this.payerService.findById(id);

      res.json({
        success: true,
        data: payer
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const payers = await this.payerService.findAll();

      res.json({
        success: true,
        data: payers
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request<PayerParamsDto, {}, UpdatePayerDto>, res: Response) {
    try {
      const { id } = req.params;
      const name = req.body.name;
      const payer = await this.payerService.update(id, {
        name
      });

      res.json({
        success: true,
        message: 'Pagador atualizado com sucesso',
        data: payer
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request<PayerParamsDto>, res: Response) {
    try {
      const { id } = req.params;
      await this.payerService.delete(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
