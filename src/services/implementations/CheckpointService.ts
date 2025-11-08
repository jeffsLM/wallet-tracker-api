import { PrismaClient, Prisma } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import * as amqp from 'amqplib';
import { ICheckpointService } from '../interfaces/ICheckpointSevice';

@injectable()
export class CheckpointService implements ICheckpointService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('RabbitMQConfig') private config: { url: string; queue: string }
  ) { }

  async checkAfterTransaction(accountId: string): Promise<void> {
    try {
      const competence = new Date();
      const startOfMonth = new Date(competence.getFullYear(), competence.getMonth(), 1);
      const endOfMonth = new Date(competence.getFullYear(), competence.getMonth() + 1, 0);

      // 1️⃣ Buscar a conta com família e grupo (contas credit ativas)
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        include: {
          family: {
            include: {
              accounts: { where: { active: true, type: 'CREDITO' }, select: { id: true, name: true } }
            }
          },
          group: {
            include: {
              accounts: { where: { active: true }, select: { id: true, name: true } }
            }
          },
        },
      });

      if (!account) return;

      // 2️⃣ Buscar checkpoints vinculados (conta, grupo, família)
      const checkpoints = await this.prisma.balanceCheckpoint.findMany({
        where: {
          active: true,
          OR: [
            { accountId },
            { groupId: account.groupId ?? undefined },
            { familyId: account.familyId, type: 'family' }
          ]
        },
      });

      if (checkpoints.length === 0) return;

      // 3️⃣ Buscar notificações já enviadas no mês
      const existingNotifications = await this.prisma.checkpointNotification.findMany({
        where: {
          checkpointId: { in: checkpoints.map(c => c.id) },
          competence: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: { checkpointId: true }
      });

      const notifiedCheckpoints = new Set(existingNotifications.map(n => n.checkpointId));

      // 4️⃣ Selecionar quais contas consultar (só crédito)
      const accountIds = new Set<string>();
      if (checkpoints.some(c => c.type === 'family') && account.family?.accounts && account.type === 'CREDITO') {
        account.family.accounts.forEach(a => accountIds.add(a.id));
      }
      if (checkpoints.some(c => c.type === 'group') && account.group?.accounts) {
        account.group.accounts.forEach(a => accountIds.add(a.id));
      }
      if (checkpoints.some(c => c.type === 'account') && account.type === 'CREDITO') {
        accountIds.add(account.id);
      }


      if (accountIds.size === 0) return;

      // 5️⃣ Buscar transações do período
      const transactions = await this.prisma.transaction.findMany({
        where: {
          accountId: { in: [...accountIds] },
          accountingPeriod: { gte: startOfMonth, lte: endOfMonth },
        },
        select: {
          accountId: true,
          amount: true,
          payer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } }
        }
      });

      const accountTotals = this.calculateTotalsInMemory(transactions);
      const payerTotals = this.calculatePayerTotalsInMemory(transactions);

      // 6️⃣ Processar apenas checkpoints ainda não notificados
      for (const checkpoint of checkpoints) {
        if (!notifiedCheckpoints.has(checkpoint.id)) {
          await this.processCheckpoint(checkpoint, accountTotals, payerTotals, competence, account);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar checkpoints:', error);
    }
  }

  /**
   * Calcula totais por conta processando em memória
   */
  private calculateTotalsInMemory(
    transactions: Array<{ accountId: string; amount: any }>
  ): Map<string, number> {
    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      const accountId = transaction.accountId;
      const amount = Math.abs(Number(transaction.amount || 0));
      const currentTotal = totals.get(accountId) || 0;
      totals.set(accountId, currentTotal + amount);
    }

    return totals;
  }

  /**
   * Calcula totais por pagador processando em memória
   */
  private calculatePayerTotalsInMemory(
    transactions: Array<{
      accountId: string;
      amount: any;
      payer?: { id: string; name: string } | null;
      user?: { id: string; name: string } | null;
    }>
  ): Map<string, { name: string; total: number }> {
    const totals = new Map<string, { name: string; total: number }>();

    for (const transaction of transactions) {
      // Prioriza payer, se não existir usa user
      const payerInfo = transaction.payer || transaction.user;

      if (payerInfo) {
        const amount = Math.abs(Number(transaction.amount || 0));
        const current = totals.get(payerInfo.id) || { name: payerInfo.name, total: 0 };
        totals.set(payerInfo.id, {
          name: payerInfo.name,
          total: current.total + amount
        });
      }
    }

    return totals;
  }

  /**
   * Processa um checkpoint individual (sem queries adicionais)
   */
  private async processCheckpoint(
    checkpoint: any,
    accountTotals: Map<string, number>,
    payerTotals: Map<string, { name: string; total: number }>,
    competence: Date,
    account: any
  ): Promise<void> {
    // Calcula o total baseado no tipo de checkpoint
    let currentTotal = 0;
    let targetName = account.name;

    if (checkpoint.type === 'account') {
      currentTotal = accountTotals.get(checkpoint.accountId) || 0;
      targetName = account.name;
    } else if (checkpoint.type === 'group' && checkpoint.groupId && account.group) {
      // Soma todos os totais das contas do grupo
      for (const acc of account.group.accounts) {
        currentTotal += accountTotals.get(acc.id) || 0;
      }
      targetName = account.group.name || 'Grupo';
    } else if (checkpoint.type === 'family' && account.family) {
      // Soma todos os totais das contas da família
      for (const acc of account.family.accounts) {
        currentTotal += accountTotals.get(acc.id) || 0;
      }
      targetName = account.family.name;
    }

    const threshold = Number(checkpoint.threshold);

    // Verifica se o checkpoint foi atingido
    if (currentTotal >= threshold) {
      await this.sendWhatsAppMessage(
        checkpoint,
        currentTotal,
        competence,
        account,
        targetName,
        checkpoint.type === 'family' ? payerTotals : null
      );
    }
  }

  /**
   * Envia mensagem para fila do RabbitMQ
   */
  private async sendWhatsAppMessage(
    checkpoint: any,
    currentTotal: number,
    competence: Date,
    account: any,
    targetName: string,
    payerTotals: Map<string, { name: string; total: number }> | null = null
  ): Promise<void> {
    let connection;
    let channel;

    try {
      connection = await amqp.connect(this.config.url);
      channel = await connection.createChannel();

      await channel.assertQueue(this.config.queue, { durable: true });

      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const competenceStr = `${monthNames[competence.getMonth()]}/${competence.getFullYear()}`;

      const messageText = this.buildWhatsAppMessage(
        checkpoint,
        currentTotal,
        competenceStr,
        targetName,
        payerTotals
      );

      channel.sendToQueue(
        this.config.queue,
        Buffer.from(messageText),
        { persistent: true }
      );

      const messageId = `msg_${Date.now()}_${Math.random().toString(36)}`;

      await this.prisma.checkpointNotification.create({
        data: {
          checkpointId: checkpoint.id,
          competence: new Date(competence.getFullYear(), competence.getMonth(), 1),
          sentAt: new Date(),
          totalAmount: currentTotal,
          messageId,
          status: 'sent',
        },
      });

      console.log(`✅ Checkpoint ${checkpoint.id} atingido - Mensagem enviada`);

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      await this.prisma.checkpointNotification.create({
        data: {
          checkpointId: checkpoint.id,
          competence: new Date(competence.getFullYear(), competence.getMonth(), 1),
          sentAt: new Date(),
          totalAmount: currentTotal,
          status: 'failed',
        },
      });

    } finally {
      if (channel) await channel.close();
      if (connection) await connection.close();
    }
  }

  /**
   * Monta a mensagem formatada para WhatsApp
   */
  private buildWhatsAppMessage(
    checkpoint: any,
    currentTotal: number,
    competence: string,
    targetName: string,
    payerTotals: Map<string, { name: string; total: number }> | null = null
  ): string {
    const threshold = Number(checkpoint.threshold);
    const emoji = currentTotal >= threshold * 1.2 ? '🚨' : '⚠️';

    let targetText = '';
    if (checkpoint.type === 'account') {
      targetText = `*Cartão:* ${targetName}`;
    } else if (checkpoint.type === 'group') {
      targetText = `*Grupo:* ${targetName}`;
    } else {
      targetText = `*Família:* ${targetName}`;
    }

    let message = `${emoji} *Alerta de Gastos*

${targetText}
*Período:* ${competence}

*Checkpoint:* R$ ${threshold.toFixed(2)}
*Total Gasto:* R$ ${currentTotal.toFixed(2)}

Você atingiu o limite de gastos definido para este período!`;

    // Adiciona demonstrativo por pagador apenas para checkpoints de família
    if (checkpoint.type === 'family' && payerTotals && payerTotals.size > 0) {
      message += '\n\n📊 *Demonstrativo por Pagador:*\n';

      // Ordena os pagadores por valor (maior para menor)
      const sortedPayers = Array.from(payerTotals.entries())
        .sort((a, b) => b[1].total - a[1].total);

      for (const [_, payerData] of sortedPayers) {
        const percentage = (payerData.total / currentTotal) * 100;
        message += `\n• ${payerData.name}: R$ ${payerData.total.toFixed(2)} (${percentage.toFixed(1)}%)`;
      }
    }

    return message;
  }
}
