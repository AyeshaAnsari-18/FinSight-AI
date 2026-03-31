import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { journals: [], tasks: [], policies: [], documents: [] };
    }

    const searchStr = query.trim();

    const [journals, tasks, policies, documents] = await Promise.all([
      // Search Journal Entries
      this.prisma.journalEntry.findMany({
        where: {
          OR: [
            { id: { contains: searchStr, mode: 'insensitive' } },
            { description: { contains: searchStr, mode: 'insensitive' } },
            { reference: { contains: searchStr, mode: 'insensitive' } },
            { flagReason: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),

      // Search Tasks
      this.prisma.task.findMany({
        where: {
          OR: [
            { id: { contains: searchStr, mode: 'insensitive' } },
            { title: { contains: searchStr, mode: 'insensitive' } },
            { description: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true, email: true } } }
      }),

      // Search Policies
      this.prisma.policy.findMany({
        where: {
          OR: [
            { id: { contains: searchStr, mode: 'insensitive' } },
            { title: { contains: searchStr, mode: 'insensitive' } },
            { content: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),

      // Search Documents
      this.prisma.document.findMany({
        where: {
          OR: [
            { id: { contains: searchStr, mode: 'insensitive' } },
            { fileName: { contains: searchStr, mode: 'insensitive' } },
            { extractedText: { contains: searchStr, mode: 'insensitive' } },
            { summary: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    return {
      journals,
      tasks,
      policies,
      documents
    };
  }
}
