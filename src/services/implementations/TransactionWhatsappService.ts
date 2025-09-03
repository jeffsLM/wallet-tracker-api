import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

import { injectable, inject } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { ITransactionWhatsappService } from '../interfaces/ITrasactionWhatsappService';
import { ITransactionRepository } from '../../repositories/interfaces/ITransactionRepository';
import { IAccountRepository } from '../../repositories/interfaces/IAccountRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { WhatsappPluginTransactionDto } from '../../shared/dtos/transactionWhatsappPlugin.dto';
import { IFamilyRepository } from '../../repositories/interfaces/IFamilyRepository';
import { IPayerRepository } from '../../repositories/interfaces/IPayerRepository';

@injectable()
export class TransactionWhatsappService implements ITransactionWhatsappService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('AccountRepository')
    private accountRepository: IAccountRepository,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('FamilyRepository')
    private familyRepository: IFamilyRepository,
    @inject('PayerRepository')
    private payerRepository: IPayerRepository
  ) { }

  async create(data: WhatsappPluginTransactionDto): Promise<Transaction[]> {
    const defaultPayer = await this.payerRepository.findDefaultPayer();

    let userInfo = await this.userRepository.findByPhoneNumber(data.user || '');
    let userWasCreated = false;
    if (!userInfo) {
      const familyAllFamilies = await this.familyRepository.findAll();
      userInfo = await this.userRepository.create({
        name: 'Usuário Sem Cadastro WhatsApp',
        phone: data.user || '',
        familyId: familyAllFamilies[0].id || ''
      });

      userWasCreated = true;
    }

    let accountWasCreated = false;
    let accountInfo = await this.accountRepository.findByLast4Digits(data.lastFourDigits || '');
    if (!accountInfo) {
      accountInfo = await this.accountRepository.create({
        last4Digits: data.lastFourDigits || '',
        active: true,
        familyId: userInfo.familyId,
        name: 'Conta Sem Cadastro WhatsApp',
        type: data.purchaseType
      });
      accountWasCreated = true;
    }

    // Convertendo o valor da transação
    const totalAmount = Number(
      data.amount?.replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;

    const parcelas = data.parcelas || 1;
    const amountPerInstallment = totalAmount / parcelas;

    const transactionPromises = Array.from({ length: parcelas }, (_, i) => {
      let baseDate = dayjs().tz('America/Sao_Paulo');
      let installmentDate = baseDate.add(i, 'month');

      const isLastDayOfMonth = baseDate.date() === baseDate.endOf('month').date();

      if (isLastDayOfMonth) installmentDate = installmentDate.endOf('month');
      if (!isLastDayOfMonth) {
        const originalDay = baseDate.date();
        const lastDayOfDestinationMonth = installmentDate.endOf('month').date();

        const dayToSet = Math.min(originalDay, lastDayOfDestinationMonth);
        installmentDate = installmentDate.date(dayToSet);
      }

      return this.transactionRepository.create({
        accountId: accountInfo.id,
        userId: userInfo.id,
        accountingPeriod: installmentDate.toDate(), // Converte de volta para Date se necessário
        amount: amountPerInstallment,
        operationType: data.purchaseType || 'CREDITO',
        description: `Integrado via WhatsApp - Parcela ${i + 1} de ${parcelas} | ${data.id}`,
        finalInstallment: parcelas,
        installment: i + 1,
        ocr: data.ocrText,
        status: accountWasCreated || userWasCreated ? 'INCONSISTENT' : data.status,
        payerId: defaultPayer ? defaultPayer.id : undefined
      });
    });
    const transactions = (await Promise.allSettled(transactionPromises)).filter((result): result is PromiseFulfilledResult<Transaction> => {
      if (result.status === 'fulfilled') {
        return true;
      }
      console.error('Transaction failed:', result.reason);
      return false;
    }).map(result => result.value);

    return transactions;
  }
}
