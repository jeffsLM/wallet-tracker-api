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
      // Busca a conta e família
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        include: {
          family: true,
          group: true,
        },
      });

      if (!account) return;

      const competence = new Date();
      const startOfMonth = new Date(competence.getFullYear(), competence.getMonth(), 1);

      // Calcula o total acumulado no mês para esta conta
      const monthTotal = await this.calculateMonthlyTotal(accountId, competence);

      // Busca checkpoints ativos para esta conta/grupo/família
      const checkpoints = await this.prisma.balanceCheckpoint.findMany({
        where: {
          active: true,
          OR: [
            { accountId },
            { groupId: account.groupId || undefined },
            { familyId: account.familyId, type: 'family' },
          ],
        },
      });

      // Processa cada checkpoint
      for (const checkpoint of checkpoints) {
        await this.processCheckpoint(checkpoint, monthTotal, startOfMonth, account);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar checkpoints:', error);
      // Não lança erro para não quebrar o fluxo principal
    }
  }

  /**
   * Calcula o total gasto no mês (apenas gastos: crédito, débito, refeição)
   */
  private async calculateMonthlyTotal(accountId: string, competence: Date): Promise<number> {
    const startOfMonth = new Date(competence.getFullYear(), competence.getMonth(), 1);
    const endOfMonth = new Date(competence.getFullYear(), competence.getMonth() + 1, 0);

    const result = await this.prisma.transaction.aggregate({
      where: {
        accountId,
        accountingPeriod: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    return Math.abs(Number(result._sum.amount || 0));
  }

  /**
   * Calcula total para grupo
   */
  private async calculateGroupMonthlyTotal(groupId: string, competence: Date): Promise<number> {
    const accounts = await this.prisma.account.findMany({
      where: { groupId, active: true },
      select: { id: true },
    });

    const totals = await Promise.all(
      accounts.map(acc => this.calculateMonthlyTotal(acc.id, competence))
    );

    return totals.reduce((sum, total) => sum + total, 0);
  }

  /**
   * Calcula total para família inteira
   */
  private async calculateFamilyMonthlyTotal(familyId: string, competence: Date): Promise<number> {
    const accounts = await this.prisma.account.findMany({
      where: { familyId, active: true },
      select: { id: true },
    });

    const totals = await Promise.all(
      accounts.map(acc => this.calculateMonthlyTotal(acc.id, competence))
    );

    return totals.reduce((sum, total) => sum + total, 0);
  }

  /**
   * Processa um checkpoint individual
   */
  private async processCheckpoint(
    checkpoint: any,
    accountTotal: number,
    competence: Date,
    account: any
  ): Promise<void> {
    // Verifica se já foi enviada notificação para este checkpoint neste mês
    const existingNotification = await this.prisma.checkpointNotification.findUnique({
      where: {
        checkpointId_competence: {
          checkpointId: checkpoint.id,
          competence,
        },
      },
    });

    if (existingNotification) {
      // Já enviou notificação para este checkpoint neste mês
      return;
    }

    // Calcula o total baseado no tipo de checkpoint
    let currentTotal = accountTotal;
    let targetName = account.name;

    if (checkpoint.type === 'group' && checkpoint.groupId) {
      currentTotal = await this.calculateGroupMonthlyTotal(checkpoint.groupId, competence);
      const group = await this.prisma.group.findUnique({
        where: { id: checkpoint.groupId },
      });
      targetName = group?.name || 'Grupo';
    } else if (checkpoint.type === 'family') {
      currentTotal = await this.calculateFamilyMonthlyTotal(checkpoint.familyId, competence);
      targetName = account.family.name;
    }

    const threshold = Number(checkpoint.threshold);

    // Verifica se o checkpoint foi atingido
    if (currentTotal >= threshold) {
      await this.sendWhatsAppMessage(checkpoint, currentTotal, competence, account, targetName);
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
    targetName: string
  ): Promise<void> {
    let connection;
    let channel;

    try {
      // Conecta ao RabbitMQ
      connection = await amqp.connect(this.config.url);
      channel = await connection.createChannel();

      // Garante que a fila existe
      await channel.assertQueue(this.config.queue, { durable: true });

      // Formata a competência
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const competenceStr = `${monthNames[competence.getMonth()]}/${competence.getFullYear()}`;

      // Monta mensagem formatada
      const messageText = this.buildWhatsAppMessage(
        checkpoint,
        currentTotal,
        competenceStr,
        targetName
      );

      // Envia para a fila
      channel.sendToQueue(
        this.config.queue,
        Buffer.from(JSON.stringify(messageText)),
        { persistent: true }
      );

      // Registra notificação no banco (previne duplicatas)
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
    targetName: string
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

    return `${emoji} *Alerta de Gastos*

${targetText}
*Período:* ${competence}

*Checkpoint:* R$ ${threshold.toFixed(2)}
*Total Gasto:* R$ ${currentTotal.toFixed(2)}

Você atingiu o limite de gastos definido para este período!`;
  }
}
