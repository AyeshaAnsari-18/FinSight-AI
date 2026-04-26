import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText } from '../common/security/data-protection';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { journals: [], tasks: [], policies: [], documents: [] };
    }

    const searchStr = query.trim();
    const searchLower = searchStr.toLowerCase();
    const matches = (...values: Array<string | null | undefined>) =>
      values.some((value) => (value || '').toLowerCase().includes(searchLower));

    const [journals, tasks, policies, documents] = await Promise.all([
      this.prisma.journalEntry.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true, email: true } } },
      }),
      this.prisma.policy.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.document.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      journals: journals
        .map((journal) => ({
          ...journal,
          description: decryptText(journal.description) || '',
          reference: decryptText(journal.reference) || '',
          flagReason: decryptText(journal.flagReason) || null,
        }))
        .filter((journal) =>
          matches(journal.id, journal.description, journal.reference, journal.flagReason),
        )
        .slice(0, 10),
      tasks: tasks
        .map((task) => ({
          ...task,
          title: decryptText(task.title) || '',
          description: decryptText(task.description) || null,
        }))
        .filter((task) => matches(task.id, task.title, task.description))
        .slice(0, 10),
      policies: policies
        .map((policy) => ({
          ...policy,
          title: decryptText(policy.title) || '',
          content: decryptText(policy.content) || '',
        }))
        .filter((policy) => matches(policy.id, policy.title, policy.content))
        .slice(0, 10),
      documents: documents
        .map((document) => ({
          ...document,
          fileName: decryptText(document.fileName) || '',
          fileType: decryptText(document.fileType) || '',
          extractedText: decryptText(document.extractedText) || null,
          summary: decryptText(document.summary) || null,
        }))
        .filter((document) =>
          matches(document.id, document.fileName, document.fileType, document.extractedText, document.summary),
        )
        .slice(0, 10),
    };
  }
}
