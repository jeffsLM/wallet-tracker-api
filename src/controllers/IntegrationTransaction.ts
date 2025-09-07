import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITransactionWhatsappService } from '../services/interfaces/ITrasactionWhatsappService';
import { WhatsappPluginTransactionDto } from '../shared/dtos/transactionWhatsappPlugin.dto';

@injectable()
export class IntegrationTransaction {
  constructor(
    @inject('TransactionWhatsappService')
    private transactionWhatsappService: ITransactionWhatsappService
  ) { }

  async handle(req: Request<{}, {}, WhatsappPluginTransactionDto>, res: Response) {
    try {

      console.log('[DB DEBUG] Validando QStash...');
      const transaction = await this.transactionWhatsappService.create(req.body);

      return res.status(201).json({
        success: true,
        message: 'Transação criada com sucesso',
        data: transaction
      });

    } catch (error: any) {
      console.error('Error creating WhatsApp transaction:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}
