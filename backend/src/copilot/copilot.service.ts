import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class CopilotService {
  constructor(private prisma: PrismaService) {}

  async fetchContext(role: string) {
    let context = '';
    try {
      if (role === 'COMPLIANCE' || role === 'MANAGER') {
        const policies = await this.prisma.policy.findMany({ take: 5 });
        context += `Policies: ${JSON.stringify(policies)}. `;
      }
      if (role === 'AUDITOR' || role === 'MANAGER') {
        const journals = await this.prisma.journalEntry.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        context += `Recent Journals: ${JSON.stringify(journals)}. `;
      }
      if (role === 'ACCOUNTANT' || role === 'MANAGER') {
        const tasks = await this.prisma.task.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        context += `Recent Tasks: ${JSON.stringify(tasks)}. `;
      }
    } catch (err) {
      console.error(err);
    }
    return context;
  }

  async handleChat(userId: string, role: string, message: string) {
    // 1. Fetch economic history limit
    const history = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Reverse to chronological
    const formattedHistory = history.reverse().map(m => ({ role: m.role, content: m.content }));

    // 2. Fetch live subset DB context for RAG
    const context = await this.fetchContext(role);

    // 3. Save User message
    await this.prisma.chatMessage.create({
      data: { userId, role: 'user', content: message }
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
       data: { userId, role: 'assistant', content: reply }
    });

    return { reply };
  }

  async getChatHistory(userId: string) {
     return this.prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' } // full history for frontend, frontend will manage pagination
     });
  }
}
