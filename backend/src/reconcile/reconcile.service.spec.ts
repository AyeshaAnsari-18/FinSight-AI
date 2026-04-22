import { ReconStatus } from '@prisma/client';
import { ReconcileService } from './reconcile.service';

describe('ReconcileService', () => {
  const prisma = {
    reconciliation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const engineService = {
    analyzeReconciliation: jest.fn(),
  };

  let service: ReconcileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReconcileService(prisma as any, engineService as any);
  });

  it('creates a reconciliation and stores the analyzed variance', async () => {
    engineService.analyzeReconciliation.mockResolvedValue({
      matched: false,
      variance: 250,
      discrepancies: ['Timing difference'],
    });
    prisma.reconciliation.create.mockResolvedValue({
      id: 'recon-1',
      month: new Date('2026-04-01T00:00:00.000Z'),
      bankBalance: '1000.00',
      ledgerBalance: '750.00',
      variance: '250.00',
      status: ReconStatus.DISCREPANCY,
      notes: '["Timing difference"]',
      createdAt: new Date('2026-04-22T00:00:00.000Z'),
    });

    await expect(
      service.createAndAnalyze({
        month: '2026-04-01T00:00:00.000Z',
        bankBalance: 1000,
        ledgerBalance: 750,
        notes: 'Seeded discrepancy',
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'recon-1',
        variance: 250,
        analysis: {
          matched: false,
          variance: 250,
          discrepancies: ['Timing difference'],
        },
      }),
    );
  });

  it('returns an empty summary when no reconciliations match the review scope', async () => {
    prisma.reconciliation.findMany.mockResolvedValue([]);

    await expect(
      service.reviewSummary({
        scope: 'currentYear',
        limit: 3,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          totalRecords: 0,
          discrepancyCount: 0,
        }),
        analyses: [],
      }),
    );
  });

  it('reanalyzes reconciliation records and aggregates discrepancy insights', async () => {
    const record = {
      id: 'recon-1',
      month: new Date('2026-04-01T00:00:00.000Z'),
      bankBalance: '1000.00',
      ledgerBalance: '750.00',
      variance: '250.00',
      status: ReconStatus.PENDING,
      notes: 'Initial notes',
      createdAt: new Date('2026-04-22T00:00:00.000Z'),
    };

    prisma.reconciliation.findMany.mockResolvedValue([record]);
    engineService.analyzeReconciliation.mockResolvedValue({
      matched: false,
      variance: 250,
      discrepancies: ['Missing supporting document'],
    });
    prisma.reconciliation.update.mockResolvedValue({
      ...record,
      status: ReconStatus.DISCREPANCY,
      notes: '["Missing supporting document"]',
    });

    const result = await service.reviewSummary({
      scope: 'all',
      limit: 4,
    } as any);

    expect(result.summary).toEqual(
      expect.objectContaining({
        totalRecords: 1,
        discrepancyCount: 1,
        pendingCount: 0,
        largestVariance: 250,
      }),
    );
    expect(result.analyses[0]).toEqual(
      expect.objectContaining({
        id: 'recon-1',
        matched: false,
        discrepancies: ['Missing supporting document'],
      }),
    );
  });
});
