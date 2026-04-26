import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import axios from 'axios';

@Injectable()
export class CopilotService {
  constructor(private prisma: PrismaService) {}

  async fetchContext(role: string) {
    const contextParts: Record<string, unknown> = {};
    try {
      if (role === 'COMPLIANCE' || role === 'MANAGER') {
        const policies = await this.prisma.policy.findMany({ take: 5 });
        contextParts.policies = policies.map((policy) => ({
          id: policy.id,
          title: decryptText(policy.title) || '',
          category: decryptText(policy.category) || policy.category,
          content: decryptText(policy.content) || '',
        }));
      }
      if (role === 'AUDITOR' || role === 'MANAGER') {
        const journals = await this.prisma.journalEntry.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        contextParts.journals = journals.map((journal) => ({
          id: journal.id,
          date: journal.date,
          description: decryptText(journal.description) || '',
          reference: decryptText(journal.reference) || '',
          debit: journal.debit,
          credit: journal.credit,
          status: journal.status,
          riskScore: journal.riskScore,
          flagReason: decryptText(journal.flagReason) || null,
        }));
      }
      if (role === 'ACCOUNTANT' || role === 'MANAGER') {
        const tasks = await this.prisma.task.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        contextParts.tasks = tasks.map((task) => ({
          id: task.id,
          title: decryptText(task.title) || '',
          description: decryptText(task.description) || null,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        }));
      }
    } catch (err) {
      console.error(err);
    }
    return JSON.stringify(contextParts);
  }

  async handleChat(userId: string, role: string, message: string) {
    // 1. Fetch economic history limit
    const history = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Reverse to chronological
    const formattedHistory = history.reverse().map((m) => ({
      role: m.role,
      content: decryptText(m.content) || '',
    }));

    // 2. Fetch live subset DB context for RAG
    const context = await this.fetchContext(role);

    // 3. Save User message
    await this.prisma.chatMessage.create({
      data: { userId, role: 'user', content: encryptText(message) || '' }
    });

    // 4. Call engine RAG Endpoint
    let reply = "";
    try {
      const response = await axios.post(`${process.env.ENGINE_URL || 'http://localhost:8000'}/copilot/rag`, {
        role,
        message,
        context: context || "No dynamic context.",
        history: formattedHistory
      });
      reply = response.data.reply;
    } catch(err) {
      reply = "Sorry, the AI engine is currently unreachable.";
      console.error(err);
    }

    // 5. Save AI reply
    await this.prisma.chatMessage.create({
       data: { userId, role: 'assistant', content: encryptText(reply) || '' }
    });

    return { reply };
  }

  async getChatHistory(userId: string) {
     return this.prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' } // full history for frontend, frontend will manage pagination
     }).then((messages) =>
       messages.map((message) => ({
         ...message,
         content: decryptText(message.content) || '',
       })),
     );
  }
}
