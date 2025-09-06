import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { Receiver } from '@upstash/qstash';
import { ITransactionWhatsappService } from '../services/interfaces/ITrasactionWhatsappService';
import { WhatsappPluginTransactionDto } from '../shared/dtos/transactionWhatsappPlugin.dto';

@injectable()
export class IntegrationTransaction {
  private receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  constructor(
    @inject('TransactionWhatsappService')
    private transactionWhatsappService: ITransactionWhatsappService
  ) { }

  private async validateQStash(req: Request): Promise<boolean> {
    try {
      const signature = req.headers['upstash-signature'] as string;
      const body = (req as any).rawBody || JSON.stringify(req.body);

      await this.receiver.verify({
        signature,
        body: body,
      });
      return true;
    } catch (error) {
      console.error('QStash validation error:', error);
      return false;
    }
  }

  async handle(req: Request<{}, {}, WhatsappPluginTransactionDto>, res: Response) {
    try {
      const valid = await this.validateQStash(req);
      if (!valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid QStash request',
          receivedRequest: req.body
        });
      }

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
