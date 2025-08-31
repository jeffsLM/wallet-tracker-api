import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITransactionWhatsappService } from '../services/interfaces/ITrasactionWhatsappService';
import { WhatsappPluginTransactionDto } from '../shared/dtos/transactionWhatsappPlugin.dto';

@injectable()
export class IntegrationTrasaction {
  constructor(
    @inject('TransactionWhatsappService')
    private transactionWhatsappService: ITransactionWhatsappService
  ) { }

  async handle(req: Request<{}, {}, WhatsappPluginTransactionDto>, res: Response) {
    try {
      const transaction = await this.transactionWhatsappService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Transação criada com sucesso',
        data: transaction
      });
    } catch (error) {
      throw error;
    }
  }
}
