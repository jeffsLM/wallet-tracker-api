import { Transaction } from '@prisma/client';
import { WhatsappPluginTransactionDto } from '../../shared/dtos/transactionWhatsappPlugin.dto';

export interface ITransactionWhatsappService {
  create(data: WhatsappPluginTransactionDto): Promise<Transaction[]>;
}
