import { JournalStatus } from '@prisma/client';
import { JournalsService } from './journals.service';

describe('JournalsService', () => {
  const prisma = {
    journalEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const engineService = {
    analyzeJournal: jest.fn(),
  };

  let service: JournalsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JournalsService(prisma as any, engineService as any);
  });

  it('creates a journal entry and serializes numeric fields', async () => {
    prisma.journalEntry.create.mockResolvedValue({
      id: 'journal-1',
      date: new Date('2026-04-22T00:00:00.000Z'),
      description: 'Month-end entry',
      reference: 'REF-1',
      debit: '1200.00',
      credit: '1200.00',
      status: 'DRAFT',
      riskScore: null,
      flagReason: null,
      createdAt: new Date('2026-04-22T01:00:00.000Z'),
      updatedAt: new Date('2026-04-22T01:00:00.000Z'),
    });

    await expect(
      service.create({
        date: '2026-04-22T00:00:00.000Z',
        description: 'Month-end entry',
        reference: 'REF-1',
        debit: 1200,
        credit: 1200,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'journal-1',
        debit: 1200,
        credit: 1200,
        status: 'DRAFT',
      }),
    );
  });

  it('normalizes engine output during standalone analysis', async () => {
    engineService.analyzeJournal.mockResolvedValue({
      risk_score: 73,
      flags: ['Potential duplicate'],
      reasoning: '',
    });

    await expect(
      service.analyzeDraft({
        description: 'Standalone payload',
        reference: 'REF-2',
        debit: 400,
        credit: 350,
      } as any),
    ).resolves.toEqual({
      riskScore: 73,
      flags: ['Potential duplicate'],
      reasoning: 'No reasoning was returned by the AI engine.',
    });
  });

  it('returns an empty review summary when no journals match the selection', async () => {
    prisma.journalEntry.findMany.mockResolvedValue([]);

    await expect(
      service.reviewSummary({
        scope: 'currentYear',
        limit: 5,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          totalEntries: 0,
          flaggedEntries: 0,
        }),
        analyses: [],
      }),
    );
  });

  it('reanalyzes selected journals and aggregates flagged results', async () => {
    const entry = {
      id: 'journal-1',
      date: new Date('2026-04-05T00:00:00.000Z'),
      description: 'Manual adjustment',
      reference: 'ADJ-1',
      debit: '6000.00',
      credit: '5800.00',
      status: JournalStatus.DRAFT,
      riskScore: null,
      flagReason: null,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
    };

    prisma.journalEntry.findMany.mockResolvedValue([entry]);
    engineService.analyzeJournal.mockResolvedValue({
      risk_score: 92,
      flags: ['Out-of-balance entry', 'Manual override'],
      reasoning: 'Risk is elevated.',
    });
    prisma.journalEntry.update.mockResolvedValue({
      ...entry,
      status: JournalStatus.FLAGGED,
      riskScore: 92,
      flagReason: 'Out-of-balance entry | Manual override',
    });

    const result = await service.reviewSummary({
      scope: 'all',
      limit: 4,
    } as any);

    expect(result.summary).toEqual(
      expect.objectContaining({
        totalEntries: 1,
        flaggedEntries: 1,
        highestRiskScore: 92,
        averageRiskScore: 92,
      }),
    );
    expect(result.analyses[0]).toEqual(
      expect.objectContaining({
        id: 'journal-1',
        riskScore: 92,
        flags: ['Out-of-balance entry', 'Manual override'],
      }),
    );
    expect(prisma.journalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journal-1' },
        data: expect.objectContaining({
          riskScore: 92,
          status: JournalStatus.FLAGGED,
        }),
      }),
    );
  });
});
