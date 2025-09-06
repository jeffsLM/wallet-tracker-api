import dayjs from 'dayjs';

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
    const normalizedPayer = data.payer?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");

    console.log('[DB DEBUG] Buscando payer por nome:', normalizedPayer);
    let payer = await this.payerRepository.findByName(normalizedPayer || '');
    console.log('[DB DEBUG] Payer encontrado:', payer);

    if (!payer) {
      console.log('[DB DEBUG] Criando novo payer:', { name: normalizedPayer || '', default: false });
      payer = await this.payerRepository.create({
        name: normalizedPayer || '',
        default: false,
      });
      console.log('[DB DEBUG] Payer criado:', payer);
    }

    console.log('[DB DEBUG] Buscando usuário por telefone:', data.user);
    let userInfo = await this.userRepository.findByPhoneNumber(data.user || '');
    console.log('[DB DEBUG] Usuário encontrado:', userInfo);

    let userWasCreated = false;
    if (!userInfo) {
      console.log('[DB DEBUG] Buscando todas as famílias');
      const familyAllFamilies = await this.familyRepository.findAll();
      console.log('[DB DEBUG] Famílias encontradas:', familyAllFamilies.length);

      const newUser = {
        name: 'Usuário Sem Cadastro WhatsApp',
        phone: data.user || '',
        familyId: familyAllFamilies[0].id || ''
      };
      console.log('[DB DEBUG] Criando novo usuário:', newUser);

      userInfo = await this.userRepository.create(newUser);
      console.log('[DB DEBUG] Usuário criado:', userInfo);
      userWasCreated = true;
    }

    let accountWasCreated = false;
    console.log('[DB DEBUG] Buscando conta pelos últimos 4 dígitos:', data.lastFourDigits);
    let accountInfo = await this.accountRepository.findByLast4Digits(data.lastFourDigits || '');
    console.log('[DB DEBUG] Conta encontrada:', accountInfo);

    if (!accountInfo) {
      const newAccount = {
        last4Digits: data.lastFourDigits || '',
        active: true,
        familyId: userInfo.familyId,
        name: 'Conta Sem Cadastro WhatsApp',
        type: data.purchaseType
      };
      console.log('[DB DEBUG] Criando nova conta:', newAccount);

      accountInfo = await this.accountRepository.create(newAccount);
      console.log('[DB DEBUG] Conta criada:', accountInfo);
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

    console.log('[DB DEBUG] Criando', parcelas, 'transações com valor unitário:', amountPerInstallment);

    const transactionPromises = Array.from({ length: parcelas }, (_, i) => {
      let baseDate = dayjs()
      let installmentDate = baseDate.add(i, 'month');

      const isLastDayOfMonth = baseDate.date() === baseDate.endOf('month').date();

      if (isLastDayOfMonth) installmentDate = installmentDate.endOf('month');
      if (!isLastDayOfMonth) {
        const originalDay = baseDate.date();
        const lastDayOfDestinationMonth = installmentDate.endOf('month').date();

        const dayToSet = Math.min(originalDay, lastDayOfDestinationMonth);
        installmentDate = installmentDate.date(dayToSet);
      }

      const transactionData = {
        accountId: accountInfo.id,
        userId: userInfo.id,
        accountingPeriod: installmentDate.toDate(),
        amount: amountPerInstallment,
        operationType: data.purchaseType || 'CREDITO',
        description: `Integrado via WhatsApp - Parcela ${i + 1} de ${parcelas} | ${data.id}`,
        finalInstallment: parcelas,
        installment: i + 1,
        ocr: data.ocrText,
        status: accountWasCreated || userWasCreated ? 'INCONSISTENT' : data.status,
        payerId: payer.id
      };

      console.log(`[DB DEBUG] Criando transação ${i + 1}/${parcelas}:`, transactionData);

      return this.transactionRepository.create(transactionData);
    });

    console.log('[DB DEBUG] Executando Promise.allSettled para', transactionPromises.length, 'transações');
    const transactionResults = await Promise.allSettled(transactionPromises);

    const transactions = transactionResults.filter((result): result is PromiseFulfilledResult<Transaction> => {
      if (result.status === 'fulfilled') {
        console.log('[DB DEBUG] Transação criada com sucesso:', result.value.id);
        return true;
      }
      console.error('[DB DEBUG] Falha ao criar transação:', result.reason);
      return false;
    }).map(result => result.value);

    console.log('[DB DEBUG] Total de transações criadas com sucesso:', transactions.length);
    return transactions;
  }
}
